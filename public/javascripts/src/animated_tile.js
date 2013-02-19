function AnimatedTile(first, tile_properties, spritesheet){
  var _this = this;
  this.index = 0;
  this.properties = tile_properties;
  this.frames = tile_properties.frames.split(",");
  for(var i = 0; i < this.frames.length; i++){
    this.frames[i] = parseInt(this.frames[i],10);
  }
  this.first = first;
  this.img = first;
  this.spritesheet = spritesheet;
  this.speed = tile_properties.speed || 700;
  setTimeout(function(){
    _this.animate();
  }, this.speed);
}

AnimatedTile.prototype.animate = function(){
  var _this = this;
  this.index++;
  if(this.index >= this.frames.length){
    this.img = this.first;
    this.index = 0;
  }else{
    this.img = this.spritesheet.get(this.frames[this.index]).img;
  }
  $(document).trigger("redraw");
  setTimeout(function(){
    _this.animate();
  }, this.speed);
};