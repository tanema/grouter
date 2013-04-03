function AnimatedTile(base_image, tile_properties, spritesheet){
  var _this = this;
  this.index = 0;
  this.frames = tile_properties.frames.split(",");
  for(var i = 0; i < this.frames.length; i++){
    this.frames[i] = parseInt(this.frames[i],10);
  }
  this.base_image = base_image;
  this.speed = tile_properties.speed || 1000;
  this.frame_time = 0;
  Tile.call(this, base_image, tile_properties, spritesheet);


}

AnimatedTile.prototype = new Tile();

AnimatedTile.prototype.draw = function(ctx, deltatime, x, y){
  if((this.frame_time += deltatime) >= this.speed){
    this.index++;
    if(this.index >= this.frames.length){
      this.img = this.base_image;
      this.index = 0;
    }else{
      this.img = this.spritesheet.get(this.frames[this.index]).img;
    }

    this.frame_time = 0;
  }

  //call Super
  this.constructor.prototype.draw.call(this, ctx, deltatime, x, y);
};

