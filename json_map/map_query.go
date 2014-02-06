package json_map

type MapQuery struct {
  Tiles   []*Tile   `json:"tiles"`
  Objects []*Sprite `json:"objects"`
}
