var Actionable = require('./actionable.js');

function Playable(display_object_options, map, next){
  display_object_options = display_object_options || {};
  this.map = map || {};
  this.properties = display_object_options.properties || {};

  Actionable.call(this, display_object_options, map);

  if(display_object_options.properties){
    this.initalize_properties(next);
  }else{
    if(next){next(this);}
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
  if(this.is_moving || this.is_interacting){ return; }

  this.currentMovement = direction;
  this.movementIndex = 0;

  if(this._facing_solid_tile()){
    return;
  }

  this.is_moving = true;
  this.animate(direction, distance);
};

Playable.prototype.animate = function(direction, distance){
  switch(direction){
    case "left":  this.x -= this.animation_step_size; break;
    case "right": this.x += this.animation_step_size; break;
    case "up":    this.y -= this.animation_step_size; break;
    case "down":  this.y += this.animation_step_size; break;
  }
  this.movementIndex++;
  if(this.movementIndex >= this.movement[direction].length){
    //set our destination as whole values because the step size might be just out a bit
    this.x = this.to_x;
    this.y = this.to_y;

    //reset animation
    this.movementIndex = 0;
    this.is_moving = false;
    //if the distance is set that means keep walking
    if(distance > 1){
      this.move(direction, --distance);
    }
  }else{
    var _this = this;
    setTimeout(function(){
      _this.animate(direction, distance);
    }, this.animation_speed);
  }
};

//@OVERRIDE this just make sure the displayable is facing the speaker/actor
Playable.prototype.react = function(actor){
  switch(actor.currentMovement){
    case "left":  this.currentMovement = "right"; break;
    case "right": this.currentMovement = "left"; break;
    case "up":    this.currentMovement = "down"; break;
    case "down":  this.currentMovement = "up"; break;
  }

  //call Super
  this.constructor.prototype.react.call(this, actor);
};

//we set to_x and to_y here so that the animation has a defined end so we dont get rounding
//problems if the animation step is off by decimals, we round x and y to make sure are on the grid
//at the end of the animation
Playable.prototype._get_to_tile = function(){
  var to_tile;

  if(this.is_moving){
    to_tile = this.map.at(this.to_x, this.to_x);
    to_tile.x = this.to_x;
    to_tile.y = this.to_x;
  }else{
    var next_x = this.x,
        next_y = this.y;

    switch(this.currentMovement){
      case "left":  next_x--; break;
      case "right": next_x++; break;
      case "up":    next_y--; break;
      case "down":  next_y++; break;
    }

    to_tile = this.map.at(next_x, next_y);
    this.to_x = to_tile.x = next_x;
    this.to_y = to_tile.y = next_y;
  }

  return to_tile;
};

Playable.prototype._facing_solid_tile = function(){
  var to_tile = this._get_to_tile();
  if(to_tile.objects.length || to_tile.tiles.length === 0){
    return true;
  }
  for(var i = 0; i < to_tile.tiles.length; i++){
    if(to_tile.tiles[i].properties.solid){
      return true;
    }
  }
  return false;
};

module.exports = Playable;