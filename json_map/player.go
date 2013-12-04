package json_map

type Player struct {
  Id        string `json:"id"`
  *Sprite
  LayerName string `json:"layer_name"`
  Layer     *Layer `json:"layer"`
}

func (p *Player) ShallowClone() *Player {
  return &Player{
    Sprite: &Sprite{
      Type        : p.Type,
      X           : p.X,
      Y           : p.Y,
      Name        : p.Name,
      Width       : p.Width,
      Height      : p.Height,
      Properties  : p.Properties,
    },
    LayerName: p.LayerName,
  }
}
