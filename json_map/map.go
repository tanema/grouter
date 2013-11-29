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
  Player      *Sprite
  Players     []*Sprite
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

  new_map.setPlayer()

  return &new_map
}

func (m *Map) setPlayer(){
  for _, layer := range m.Layers {
    if layer.IsObjectGroup() {
      for _, sprite := range layer.Sprites {
        if sprite.IsPlayer() {
          m.Player = sprite
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
