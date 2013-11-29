package json_map

import (
  "strconv"
)

type TileSet struct {
  FirstGid   int               `json:"firstgid"`
  Name       string            `json:"name"`
  Properties map[string]string `json:"properties"`
  TileProps  map[string]*Tile  `json:"tileproperties"`
  TileWidth  float32           `json:"tilewidth"`
  TileHeight float32           `json:"tileheight"`
}

func (t *TileSet) Tile(index int64) *Tile {
  return t.TileProps[strconv.FormatInt(index, 10)]
}
