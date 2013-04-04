function Tile(base_image, tile_properties, spritesheet){
  this.properties = tile_properties;
  this.img = base_image;
  this.spritesheet = spritesheet;
}

Tile.prototype.draw = function(ctx, x, y){
  ctx.drawImage(this.img, x, y);
};