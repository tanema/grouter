var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

function TileEngine(map_src){
  if(!this.canvasIsSupported() && !!requestAnimationFrame){
    alert("Your browser does not support this game.");
    return;
  }

  var _this = this;
  this.canvas = document.getElementById('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.ctx.canvas = this.canvas;
  window.addEventListener('load', function(){
    _this.load_map(map_src);
  });
  this.keyboard = new Keyboard();
  this.startTime = window.mozAnimationStartTime || Date.now();
  this.register_socket_events(map_src);

  this.fps = 0;
  this.fps_count = 0;
  this.fps_timer = setInterval(function(){_this.updateFPS()}, 2000);
}

TileEngine.prototype.register_socket_events = function(map_src){
  this.socket = io.connect();
  this.socket.emit("join map", map_src.substr(map_src.lastIndexOf('/')+1));

  var map = this.map;
  this.socket.on('spawn player', function(id, name, player_data, layer){
    map.player_spawn(id, name, player_data, layer);
  });
  this.socket.on('spawn npc', function(layer, character_name, character_data){
    map.npc_spawn(layer, character_name, character_data);
  });
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

    requestAnimationFrame(function(timestamp){_this.draw(timestamp);});
  });
};

//the time difference does not need to be regarded in the model of this engine since the
//animations are done within thier own intervals
TileEngine.prototype.draw = function(timestamp){
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

TileEngine.prototype.updateFPS = function(){
  this.fps = this.fps_count / 2; // every two seconds cut the fps by 2
  this.fps_count = 0;
  if($("#fps").length){
    $("#fps").html(this.fps | 0);
  }
},

TileEngine.prototype.canvasIsSupported = function (){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
};