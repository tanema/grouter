package json_map

type Tile struct {
  solid     string  `json:"solid"`
}

func (tp *Tile) Solid() bool {
  return tp.solid == "true"
}
