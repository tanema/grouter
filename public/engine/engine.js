var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

function Grouter(canvas_el, map_src){
  if(!this.canvasIsSupported() && !!requestAnimationFrame){
    alert("Your browser does not support this game.");
    return;
  }

  var _this = this;
  this.canvas = document.getElementById(canvas_el);
  this.ctx = this.canvas.getContext('2d');
  this.ctx.canvas = this.canvas;

  this.keyboard = new Keyboard();
  this.startTime = window.mozAnimationStartTime || Date.now();

  this.fps_el = document.getElementById("fps"); 
  if(this.fps_el){
    this.fps = 0;
    this.fps_timer = setInterval(function(){_this.updateFPS()}, 1000);
  }

  this.socket = io.connect();
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
    _this.ctx.camera = new Camera(screen, tile_width, tile_height, map.properties.tiles_overflow);
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
  if(this.fps_timer){
    this.fps++;
  }

  //set the next animation frame
  var _this = this;
  requestAnimationFrame(function(timestamp){
    _this.draw(timestamp);
  });
};

Grouter.prototype.updateFPS = function(){
  this.fps_el.innerHTML = this.fps || 0;
  this.fps = 0;
},

Grouter.prototype.canvasIsSupported = function (){
  var elem = document.createElement('canvas');
  return !!(elem && elem.getContext && elem.getContext('2d'));
};

Grouter.prototype.getSocketId = function () {
  return this.socket.socket.sessionid;
}

Grouter.normalize_coord = function(h, j){
  return Math.floor(((2*j)+(h%j))%j)
}

Grouter.merge_objects = function(obj1, obj2) {
  for (var p in obj2) {
    if (obj1[p] && obj2[p].constructor == Object) {
      obj1[p] = Grouter.merge_objects(obj1[p], obj2[p]);
    } else {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}

Grouter.getJSON = function(url, cb) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      cb(JSON.parse(xmlhttp.responseText))
    } else if (xmlhttp.readyState==4){
      cb()
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

Grouter.bind_event = function(event_names, cb, scope){
  var events = event_names.split(" ")
  for(var i = 0; i < events.length; i++){
    document.addEventListener(events[i], function(e){
      try{
        cb.call(scope, e)
      }catch(e){
        this.removeEventListener(events[i], arguments.callee);
      }
    });
  }
}

Grouter.fire_event = function(name, extra) {
  document.dispatchEvent(new CustomEvent(name, extra))
}
