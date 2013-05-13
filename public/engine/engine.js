var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

Grouter.ServerEnabled = true;

function Grouter(canvas_el, map_src){
  if(!this.canvasIsSupported() && !!requestAnimationFrame){
    alert("Your browser does not support this game.");
    return;
  }

  var _this = this;
  this.canvas = $(canvas_el).get(0);
  this.ctx = this.canvas.getContext('2d');
  this.ctx.canvas = this.canvas;

  this.keyboard = new Keyboard();
  this.startTime = window.mozAnimationStartTime || Date.now();

  this.fps = 0;
  this.fps_count = 0;
  this.fps_timer = setInterval(function(){_this.updateFPS()}, 2000);

  if(Grouter.ServerEnabled){
    this.socket = io.connect();
  }
  window.addEventListener('load', function(){
    _this.load_map(map_src);
  });
}

Grouter.prototype.load_map = function(map_src){
  var _this = this;
  this.loaded = false;
  this.map = new Map(map_src, this);
  this.map.load(function(map){
    var tile_width = map.spritesheet.tile_width,
        tile_height = map.spritesheet.tile_height,
        screen = _this.ctx.screen = new Screen(_this.canvas, tile_width, tile_height);
    _this.ctx.viewport = new Viewport(screen, tile_width, tile_height, map.properties.tiles_overflow);
    _this.ctx.orientation = map.orientation;
    _this.loaded = true;

    requestAnimationFrame(function(timestamp){_this.draw(timestamp);});
  });
};

//the time difference does not need to be regarded in the model of this engine since the
//animations are done within thier own intervals
Grouter.prototype.draw = function(timestamp){
  if(!this.loaded){return;}

  //calculate difference since last repaint
  var drawStart = (timestamp || Date.now()),
      deltatime = drawStart - this.startTime;

  //clear last frame
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // draw down the hierarchy starting at the map
  this.map.draw(this.ctx, deltatime);

  //reset startTime to this repaint
  this.startTime = drawStart;

  //increments frame for fps display
  this.fps_count++;

  //set the next animation frame
  var _this = this;
  requestAnimationFrame(function(timestamp){_this.draw(timestamp);});
};

Grouter.prototype.updateFPS = function(){
  this.fps = this.fps_count / 2; // every two seconds cut the fps by 2
  this.fps_count = 0;
  if($("#fps").length){
    $("#fps").html(this.fps | 0);
  }
},

Grouter.prototype.canvasIsSupported = function (){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
};