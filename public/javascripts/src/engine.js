var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

function TileEngine(map_src){
  var _this = this;
  this.canvas = document.getElementById('canvas');
  this.ctx = this.canvas.getContext('2d');
  window.addEventListener('load', function(){
    _this.load_map(map_src);
  });
  this.register_events();
}

TileEngine.prototype.register_events = function(){
  this.keyboard = new Keyboard();
};

TileEngine.prototype.load_map = function(map_src){
  var _this = this;
  this.loaded = false;
  this.map = new Map(map_src, this);
  this.map.load(function(){
    var tile_width = _this.map.spritesheet.tile_width,
        tile_height = _this.map.spritesheet.tile_height,
        screen = _this.ctx.screen = new Screen(_this.canvas, tile_width, tile_height);
    _this.ctx.viewport = new Viewport(screen, tile_width, tile_height, _this.map.properties.tiles_overflow);
    _this.ctx.orientation = _this.map.orientation;
    _this.loaded = true;

    requestAnimationFrame(function(){_this.draw();});
  });
};

//the time difference does not need to be regarded in the model of this engine since the
//animations are done within thier own intervals
TileEngine.prototype.draw = function(){
  if(!this.loaded){return;}

  //clear last frame
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // draw down the hierarchy starting at the map
  this.map.draw(this.ctx);

  //set the next animation frame
  var _this = this;
  requestAnimationFrame(function(){_this.draw();});
};