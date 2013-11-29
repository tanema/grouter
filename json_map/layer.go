package json_map

type Layer struct {
  Data    []int     `json:"data"`
  Height  float32   `json:"height"`
  Width   float32   `json:"width"`
  Name    string    `json:"name"`
  Opacity float32   `json:"opacity"`
  Type    string    `json:"type"`
  Visible bool      `json:"visible"`
  X       float32   `json:"x"`
  Y       float32   `json:"y"`
  Sprites []*Sprite `json:"objects"`
}

func (l *Layer) IsTileLayer() bool {
  return l.Type == "tilelayer"
}

func (l *Layer) IsObjectGroup() bool {
  return l.Type == "objectgroup"
}
