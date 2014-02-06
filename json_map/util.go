package json_map

import (
  "math"
)

func normalize_coord(h, j float32) float32{
  h64 := float64(h)
  j64 := float64(j)
  return float32(math.Floor(math.Mod(((2*j64)+math.Mod(h64, j64)), j64)))
}
