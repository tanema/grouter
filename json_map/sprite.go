package json_map

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
}

func (p *Sprite) ShallowClone() *Sprite {
  return &Sprite{
    Type        : p.Type,
    X           : p.X,
    Y           : p.Y,
    Name        : p.Name,
    Width       : p.Width,
    Height      : p.Height,
    Properties  : p.Properties,
    LayerName   : p.LayerName,
  }
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
