package json_map

import (
  "fmt"
  "github.com/tanema/go-socket.io"
  "github.com/robertkrimen/otto"
  "io/ioutil"
)

type Sprite struct {
  Id          string            `json:"id"`
  Type        string            `json:"type"`
  X           float32           `json:"x"`
  Y           float32           `json:"y"`
  Name        string            `json:"name"`
  Width       float32           `json:"width"`
  Height      float32           `json:"height"`
  LayerName   string            `json:"layer_name"`
  Properties  map[string]string `json:"properties"`
  Map         *Map              `json:"-"`
  Layer       *Layer            `json:"-"`
  sio         *socketio.SocketIOServer `json:"-"`
  behaviour   *otto.Otto        `json:"-"`
}

func (sp *Sprite) Clone() *Sprite {
  return &Sprite{
    Type        : sp.Type,
    X           : sp.X,
    Y           : sp.Y,
    Name        : sp.Name,
    Width       : sp.Width,
    Height      : sp.Height,
    Properties  : sp.Properties,
    LayerName   : sp.LayerName,
    Layer       : sp.Layer,
    Map         : sp.Map,
  }
}

func (sp *Sprite) Ident() string {
  if sp.Id != "" {
    return sp.Id
  } else{
    return sp.Name
  }
}

func (sp *Sprite) channel() string{
  return sp.Map.Name+sp.Ident()
}

func (sp *Sprite) Solid() bool {
  return true
}
func (sp *Sprite) IsPlayer() bool {
  return sp.Type == "player"
}

func (sp *Sprite) IsNPC() bool {
  return sp.Type == "npc"
}

func (sp *Sprite) IsActionable() bool {
  return sp.Type == "actionable"
}

func (sp *Sprite) InitalizeBehaviour(){
  file, e := ioutil.ReadFile("public/maps/"+sp.Map.Name+"/actors/behaviour/"+sp.Name+".js")
  if e == nil {
    sp.behaviour = otto.New()
    sp.behaviour.Set("move", func(call otto.FunctionCall) {
      direction, _ := call.Argument(0).ToString()
      distance, _ := call.Argument(0).ToInteger()
      sp.Move(direction, distance)
    })
    _, e = sp.behaviour.Run(string(file[:]))
    if e != nil {
      fmt.Println("Javascript error in " + sp.Name + ".js : ", e)
      return
    }
  }
}

func (sp *Sprite) SetupSocket(sio *socketio.SocketIOServer){
  sp.sio = sio
  sp.sio.Of(sp.channel()).On("move", func(ns *socketio.NameSpace, to_x, to_y int64){sp.MoveTo(to_x, to_y)})
  sp.sio.Of(sp.channel()).On("change layer", func(ns *socketio.NameSpace, layer string){sp.ChangeLayer(layer)})
  sp.sio.Of(sp.channel()).On("teleport", func(ns *socketio.NameSpace, to_x, to_y int64){sp.Teleport(to_x, to_y)})
  sp.sio.Of(sp.channel()).On("set name", func(ns *socketio.NameSpace, name string){sp.ChangeName(name)})
}

func (sp *Sprite) Move(direction string, distance int64){
  if distance < 1 {
    distance = 1
  }
  to_x := int64(sp.X)
  to_y := int64(sp.Y)
  switch direction {
    case "left":
      to_x -= distance
    case "right":
      to_x += distance
    case "up":
      to_y -= distance
    case "down":
      to_y += distance
  }
  sp.MoveTo(to_x, to_y)
}

func (sp *Sprite) MoveTo(to_x, to_y int64){
  //TODO validate move
  sp.X = float32(to_x)
  sp.Y = float32(to_y)
  sp.sio.In(sp.channel()).Broadcast("move", to_x, to_y);
}

func (sp *Sprite) ChangeLayer(layer string){
  sp.LayerName = layer
  sp.sio.In(sp.channel()).Broadcast("change layer", layer);
}

func (sp *Sprite) Teleport(to_x, to_y int64){
  //TODO validate move
  sp.X = float32(to_x)
  sp.Y = float32(to_y)
  sp.sio.In(sp.channel()).Broadcast("teleport", to_x, to_y);
}

func (sp *Sprite) ChangeName(name string){
  sp.Name = name
  sp.sio.In(sp.channel()).Broadcast("change name", name)
}
