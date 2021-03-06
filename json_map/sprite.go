package json_map

import (
  "fmt"
  "../socketio"
  "github.com/robertkrimen/otto"
  "io/ioutil"
  "time"
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
  IsBusy      bool              `json:"-"`
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
  behaviour_tree_def, e := ioutil.ReadFile("public/maps/"+sp.Map.Name+"/actors/behaviour/"+sp.Name+".js")
  if e == nil {
    sp.setupBehaviour()
    _, e = sp.behaviour.Run(string(behaviour_tree_def[:]))
    if e != nil {
      fmt.Println("Javascript error in " + sp.Name + ".js : ", e)
      panic(0)
    } else {
      fmt.Println("Loaded " + sp.Name + ".js behaviour")
    }
  } else {
    fmt.Println("No behaviour found for " + sp.Name + " : ", e)
  }
}

func (sp *Sprite) Step(){
  _, e := sp.behaviour.Run(sp.Name + ".step()")
  if e != nil {
    fmt.Println("Javascript error in " + sp.Name + ".js while stepping : ", e)
  }
}

func (sp *Sprite) setupBehaviour() {
  sp.behaviour = otto.New()
  //set custom methods in javascript
  sp.behaviour.Set("look", func(call otto.FunctionCall) otto.Value {
    direction, _ := call.Argument(0).ToString()
    distance, _ := call.Argument(1).ToInteger()
    objects := []MapQuery{}
    for i := int64(1); i <= distance; i++ {
      switch direction {
        case "left":
          objects = append(objects, sp.Map.At(sp.X-float32(i), sp.Y, sp.Layer.Properties["group"]))
        case "right":
          objects = append(objects, sp.Map.At(sp.X+float32(i), sp.Y, sp.Layer.Properties["group"]))
        case "up":
          objects = append(objects, sp.Map.At(sp.X, sp.Y-float32(i), sp.Layer.Properties["group"]))
        case "down":
          objects = append(objects, sp.Map.At(sp.X, sp.Y+float32(i), sp.Layer.Properties["group"]))
      }
    }
    val, _ := sp.behaviour.ToValue(objects)
    return val
  })
  sp.behaviour.Set("position", func(call otto.FunctionCall) otto.Value {
    val, _ := sp.behaviour.ToValue(map[string]float32{"x": sp.X, "y": sp.Y})
    return val
  })
  sp.behaviour.Set("move", func(call otto.FunctionCall) otto.Value {
    direction, _ := call.Argument(0).ToString()
    distance, _ := call.Argument(1).ToInteger()
    sp.Move(direction, distance)
    return otto.UndefinedValue()
  })
  sp.behaviour.Set("setTimeout", func(call otto.FunctionCall) otto.Value {
    go func(){
      timeout, _ := call.Argument(2).ToInteger()
      time.Sleep(time.Duration(timeout) * time.Millisecond)
      call.Argument(1).Call(call.Argument(0))
    }()
    return otto.UndefinedValue()
  })

  //load behaviour tree dependancy into environment
  behaviour_tree_dep, _ := ioutil.ReadFile("lib/btree.js")
  sp.behaviour.Run(string(behaviour_tree_dep[:]))
}

func (sp *Sprite) SetupSocket(sio *socketio.SocketIOServer){
  sp.sio = sio
  sp.sio.Of(sp.channel()).On("move", func(ns *socketio.NameSpace, to_x, to_y int64){sp.MoveTo(to_x, to_y)})
  sp.sio.Of(sp.channel()).On("change layer", func(ns *socketio.NameSpace, layer string){sp.ChangeLayer(layer)})
  sp.sio.Of(sp.channel()).On("teleport", func(ns *socketio.NameSpace, to_x, to_y int64){sp.Teleport(to_x, to_y)})
  sp.sio.Of(sp.channel()).On("set name", func(ns *socketio.NameSpace, name string){sp.ChangeName(name)})
  sp.sio.Of(sp.channel()).On("interacting started", func(ns *socketio.NameSpace, name string){sp.StartInteracting()})
  sp.sio.Of(sp.channel()).On("interacting finished", func(ns *socketio.NameSpace, name string){sp.FinishInteracting()})
}

func (sp *Sprite) StartInteracting(){
  sp.IsBusy = true;
  sp.sio.In(sp.channel()).Broadcast("interacting started");
}

func (sp *Sprite) FinishInteracting(){
  sp.IsBusy = false;
  sp.sio.In(sp.channel()).Broadcast("interacting finished");
}

func (sp *Sprite) Move(direction string, distance int64){
  if sp.IsBusy {
    return
  }
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
  if sp.IsBusy {
    return
  }
  //TODO validate move
  pos := sp.Map.At(float32(to_x), float32(to_y), sp.Layer.Properties["group"])
  if len(pos.Tiles) < 1 && len(pos.Objects) < 1 {
    sp.X = normalize_coord(float32(to_x), sp.Layer.Width)
    sp.Y = normalize_coord(float32(to_y), sp.Layer.Height)
    sp.sio.In(sp.channel()).Broadcast("move", to_x, to_y);
  }
}

func (sp *Sprite) ChangeLayer(layer string){
  if sp.IsBusy {
    return
  }
  sp.LayerName = layer
  sp.sio.In(sp.channel()).Broadcast("change layer", layer);
}

func (sp *Sprite) Teleport(to_x, to_y int64){
  if sp.IsBusy {
    return
  }
  //TODO validate move
  sp.X = float32(to_x)
  sp.Y = float32(to_y)
  sp.sio.In(sp.channel()).Broadcast("teleport", to_x, to_y);
}

func (sp *Sprite) ChangeName(name string){
  sp.Name = name
  sp.sio.In(sp.channel()).Broadcast("change name", name)
}
