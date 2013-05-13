var Actionable = require('./actionable.js');

function Playable(display_object_options, map){
  display_object_options = display_object_options || {};

  Actionable.call(this, display_object_options, map);

  if(display_object_options.properties){
    this.initalize_properties();
  }
}

Playable.prototype = new Actionable();

Playable.prototype.initalize_properties = function(next){

  this.movement = {};
  var movements = ["left", "down", "up", "right", "idle"];
  for(var i = 0; i < movements.length; i++){
    if(this.properties[movements[i]] && (startend = this.properties[movements[i]].split(','))){
      this.movement[movements[i]] = [];
      var id;
      while((id = startend.shift())){
        this.movement[movements[i]].push(parseInt(id, 10));
      }
    }
  }

  this.currentMovement = "idle";
  this.movementIndex = 0;

  this.speed = this.properties.speed || 200;
  this.animation_speed = this.speed / this.movement["left"].length;
  this.animation_step_size = 1 / this.movement["left"].length;
};

Playable.prototype.teleport = function(x, y){
  this.x = x;
  this.y = y;
};

Playable.prototype.move = function(direction, distance){
  distance = distance || 1;
  this.currentMovement = direction;

  if(this._facing_solid_tile()){
    return;
  }
  this.map.socket.emit("actor move", this.name, direction, distance);
};


//we set to_x and to_y here so that the animation has a defined end so we dont get rounding
//problems if the animation step is off by decimals, we round x and y to make sure are on the grid
//at the end of the animation
Playable.prototype._get_to_tile = function(){
  var next_x = this.x,
      next_y = this.y;

  switch(this.currentMovement){
    case "left":  next_x--; break;
    case "right": next_x++; break;
    case "up":    next_y--; break;
    case "down":  next_y++; break;
  }

  var to_tile = this.map.at(next_x, next_y);
  this.to_x = to_tile.x = next_x;
  this.to_y = to_tile.y = next_y;

  return to_tile;
};

Playable.prototype._facing_solid_tile = function(){
  var to_tile = this._get_to_tile();
  if(to_tile.objects.length > 0){
    return true;
  }
  for(var i = 0; i < to_tile.tiles.length; i++){
    if(to_tile.tiles[i].solid){
      return true;
    }
  }
  return false;
};

module.exports = Playable;
