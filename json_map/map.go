package json_map

import (
  "fmt"
  "os"
  "io/ioutil"
  "encoding/json"
  "strings"
  "github.com/tanema/go-socket.io"
)

type Map struct {
  Name        string            `json:"name"`
  Height      float32           `json:"height"`
  Width       float32           `json:"width"`
  TileHeight  float32           `json:"tileheight"`
  TileWidth   float32           `json:"tilewidth"`
  Layers      []*Layer          `json:"layers"`
  Orientation string            `json:"orientation"`
  TileSets    []*TileSet        `json:"tilesets"`
  Properties  map[string]string `json:"properties"`
  Player      *Sprite
  Players     map[string]*Sprite
  Npcs        map[string]*Sprite
  sio         *socketio.SocketIOServer
  Version     float32           `json:"version"`
}

func NewMap(map_path string, sio *socketio.SocketIOServer) *Map {
  file, e := ioutil.ReadFile(map_path)
  if e != nil {
    fmt.Printf("File error: %v\n", e)
    os.Exit(1)
  }
  var new_map Map
  json.Unmarshal(file, &new_map)

  new_map.Name = map_path[strings.LastIndex(map_path, "/")+1:len(map_path)]
  new_map.sio = sio
  new_map.Players = map[string]*Sprite{}
  new_map.Npcs = map[string]*Sprite{}

  new_map.initializeObjects()
  new_map.setupConnections()
  return &new_map
}

//this method normalizes all the objects position to tile position
//rather than abs coordinates
func (m *Map) initializeObjects(){
  for _, layer := range m.Layers {
    if layer.IsObjectGroup() {
      for _, sprite := range layer.Sprites {
        sprite.X = sprite.X / m.TileWidth
        sprite.Y = sprite.Y / m.TileHeight
        sprite.LayerName = layer.Name
        sprite.SetupSocket(m.sio)
        if sprite.IsNPC() {
          m.Npcs[sprite.Name] = sprite
        } else if sprite.IsPlayer() {
          m.Player = sprite
        }
      }
    }
  }
}

func (m *Map) setupConnections() {
  m.sio.Of(m.Name).On("connect", m.join)
  m.sio.Of(m.Name).On("player move", m.player_move)
  m.sio.Of(m.Name).On("player change layer", m.player_change_layer)
  m.sio.Of(m.Name).On("player teleport", m.player_teleport)
  m.sio.Of(m.Name).On("set name", m.player_change_name)
}

func (m *Map) join(ns *socketio.NameSpace){
  println("player joined map")
  ns.Session.Values["map"] = m.Name

  new_player := m.Player.ShallowClone()
  new_player.Id = ns.Id()
  if ns.Session.Values["x"] != nil && ns.Session.Values["y"] != nil {
    new_player.X = ns.Session.Values["x"].(float32)
    new_player.Y = ns.Session.Values["y"].(float32)
  }
  if ns.Session.Values["layer"] != nil {
    new_player.LayerName = ns.Session.Values["layer"].(string)
  }

  connected_data := struct {
    Player    *Sprite            `json:"player"`
    Players   map[string]*Sprite `json:"players"`
    Npcs      map[string]*Sprite `json:"npcs"`
  }{
    new_player,
    m.Players,
    m.Npcs,
  }

  //set the players initial data
  ns.Emit("player connected", connected_data);
  //tell everyone else about this player
  m.Players[new_player.Id] = new_player
  m.sio.In(m.Name).Except(ns).Broadcast("spawn player", new_player);
}

func (m *Map) player_move(ns *socketio.NameSpace, to_x, to_y int){
  //TODO validate move
  player := m.Players[ns.Id()]
  player.X = float32(to_x)
  player.Y = float32(to_y)
  m.sio.In(m.Name).Except(ns).Broadcast("actor move", ns.Id(), to_x, to_y);
}

func (m *Map) player_change_layer(ns *socketio.NameSpace, layer string){
  player := m.Players[ns.Id()]
  player.LayerName = layer
  m.sio.In(m.Name).Except(ns).Broadcast("actor change layer", ns.Id(), layer);
}

func (m *Map) player_teleport(ns *socketio.NameSpace, to_x, to_y int){
  //TODO validate move
  player := m.Players[ns.Id()]
  player.X = float32(to_x)
  player.Y = float32(to_y)
  m.sio.In(m.Name).Except(ns).Broadcast("actor teleport", ns.Id(), to_x, to_y);
}

func (m *Map) player_change_name(ns *socketio.NameSpace, name string){
  ns.Session.Values["name"] = name
  m.sio.In(m.Name).Broadcast("change name", ns.Id(), name)
}

func (m *Map) At(x, y float32) []MapObject {
  results := []MapObject{}
  for _, layer := range m.Layers {
    if layer.IsTileLayer() {
      tile_index := layer.Data[int(x + y * layer.Width)] - 1
      tile := m.TileSets[0].Tile(int64(tile_index))
      results = append(results, tile)
    } else if layer.IsObjectGroup() {
      for _, sprite := range layer.Sprites {
        if sprite.X == x && sprite.Y == y {
          results = append(results, sprite)
        }
      }
    }
  }
  return results
}
