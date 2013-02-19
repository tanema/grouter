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
  var _this = this;
  $(document).on('redraw', function(){
    _this.draw();
  });
  this.keyboard = new Keyboard();
};

TileEngine.prototype.load_map = function(map_src){
  var _this = this;
  this.map = new Map(map_src);
  this.map.load(function(){
    var tile_width = _this.map.spritesheet.tile_width,
        tile_height = _this.map.spritesheet.tile_height,
        screen = _this.ctx.screen = new Screen(_this.canvas, tile_width, tile_height);
    _this.ctx.viewport = new Viewport(screen, tile_width, tile_height, _this.map.properties.tiles_overflow);
    _this.ctx.orientation = _this.map.orientation;
    _this.draw();
  });
};

TileEngine.prototype.draw = function(){
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.map.draw(this.ctx);
};