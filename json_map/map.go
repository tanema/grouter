package json_map

import (
  "fmt"
  "os"
  "io/ioutil"
  "encoding/json"
)

type Map struct {
  Height      float32           `json:"height"`
  Width       float32           `json:"width"`
  TileHeight  float32           `json:"tileheight"`
  TileWidth   float32           `json:"tilewidth"`
  Layers      []*Layer          `json:"layers"`
  Orientation string            `json:"orientation"`
  TileSets    []*TileSet        `json:"tilesets"`
  Properties  map[string]string `json:"properties"`
  Player      *Player
  Players     map[string]*Player
  Npcs        map[string]*Sprite
  Version     float32           `json:"version"`
}

func NewMap(map_path string) *Map {
  file, e := ioutil.ReadFile(map_path)
  if e != nil {
    fmt.Printf("File error: %v\n", e)
    os.Exit(1)
  }
  var new_map Map
  json.Unmarshal(file, &new_map)

  new_map.Players = map[string]*Player{}
  new_map.Npcs = map[string]*Sprite{}

  new_map.normalizeObjects()
  new_map.setPlayer()
  return &new_map
}

//this method normalizes all the objects position to tile position
//rather than abs coordinates
func (m *Map) normalizeObjects(){
  for _, layer := range m.Layers {
    if layer.IsObjectGroup() {
      for _, sprite := range layer.Sprites {
        sprite.X = sprite.X / m.TileWidth
        sprite.Y = sprite.Y / m.TileHeight
        m.Npcs[sprite.Name] = sprite
      }
    }
  }
}

func (m *Map) setPlayer(){
  for _, layer := range m.Layers {
    if layer.IsObjectGroup() {
      for _, sprite := range layer.Sprites {
        if sprite.IsPlayer() {
          m.Player = &Player{
            Sprite: sprite,
            LayerName: layer.Name,
            Layer: layer,
          }
          return
        }
      }
    }
  }
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
