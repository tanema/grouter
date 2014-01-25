function Viewport(screen, tile_width, tile_height, tiles_overflow){
  this.screen = screen;
  this.x = 0;
  this.y = 0;
  this.tile_width = tile_width;
  this.tile_height = tile_height;
  this.overflowTile = tiles_overflow || 5;
}

Viewport.prototype.set = function(x, y)
{
   this.x = x - (this.screen.width  - this.tile_width) / (this.tile_width * 2);
   this.y = y - (this.screen.height - this.tile_height) / (this.tile_height * 2);
};

Viewport.prototype.left = function(){
  return this.x - this.overflowTile;
};

Viewport.prototype.right = function(){
  return this.x + this.screen.tilesX + this.overflowTile;
};

Viewport.prototype.top = function(){
  return this.y - this.overflowTile;
};

Viewport.prototype.bottom = function(){
  return this.y + this.screen.tilesY + this.overflowTile;
};

Viewport.prototype.isInside = function(x, y, layer) {
   if(x > this.left() && x < this.right() && y > this.top() && y < this.bottom()){
     return [x,y]
   } else if((x+layer.width) > this.left() && (x+layer.width) < this.right()){
     if(y > this.top() && y < this.bottom()){
      return [x+layer.width, y]
     } else if((y+layer.height) > this.top() && (y+layer.height) < this.bottom()){
      return [x+layer.width, y+layer.height]
     } else if((y-layer.height) > this.top() && (y-layer.height) < this.bottom()){
      return [x+layer.width, y-layer.height]
     }
   } else if((x-layer.width) > this.left() && (x-layer.width) < this.right()){
     if(y > this.top() && y < this.bottom()){
      return [x-layer.width, y]
     } else if((y+layer.height) > this.top() && (y+layer.height) < this.bottom()){
      return [x-layer.width, y+layer.height]
     } else if((y-layer.height) > this.top() && (y-layer.height) < this.bottom()){
      return [x-layer.width, y-layer.height]
     }
   }
   return false
};
