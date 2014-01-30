package json_map

import (
  "github.com/tanema/go-socket.io"
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

func (sp *Sprite) SetupSocket(sio *socketio.SocketIOServer){
  sp.sio = sio
  sp.sio.Of(sp.channel()).On("move", sp.Move)
  sp.sio.Of(sp.channel()).On("change layer", sp.ChangeLayer)
  sp.sio.Of(sp.channel()).On("teleport", sp.Teleport)
  sp.sio.Of(sp.channel()).On("set name", sp.ChangeName)
}

func (sp *Sprite) Move(ns *socketio.NameSpace, to_x, to_y int){
  println(sp.channel() +"moving")
  //TODO validate move
  sp.X = float32(to_x)
  sp.Y = float32(to_y)
  sp.sio.In(sp.channel()).Broadcast("move", to_x, to_y);
}

func (sp *Sprite) ChangeLayer(ns *socketio.NameSpace, layer string){
  sp.LayerName = layer
  sp.sio.In(sp.channel()).Broadcast("change layer", layer);
}

func (sp *Sprite) Teleport(ns *socketio.NameSpace, to_x, to_y int){
  //TODO validate move
  sp.X = float32(to_x)
  sp.Y = float32(to_y)
  sp.sio.In(sp.channel()).Broadcast("teleport", to_x, to_y);
}

func (sp *Sprite) ChangeName(ns *socketio.NameSpace, name string){
  sp.Name = name
  sp.sio.In(sp.channel()).Broadcast("change name", name)
}
