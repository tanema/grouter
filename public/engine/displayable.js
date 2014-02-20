function Displayable(display_object_options, map, layer, next){
  display_object_options = display_object_options || {};

  Actionable.call(this, display_object_options, map, layer);

  if(display_object_options.properties){
    this.initalize_properties(next);
  }else{
    if(next){next(this);}
  }
}

Displayable.prototype = new Actionable();

Displayable.prototype.initalize_properties = function(next){
  this.map_tile_width = this.map.spritesheet.tile_width;
  this.map_tile_height = this.map.spritesheet.tile_height;
  this.tilewidth = parseInt(this.properties.width,10)|| this.map_tile_width;
  this.tileheight = parseInt(this.properties.height, 10) || this.map_tile_height;
  this.offset_x = this.tilewidth - this.map_tile_width;
  this.offset_y = this.tileheight - this.map_tile_height;

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

  this.currentMovement = "down";
  this.frame_time = 0;
  this.movementIndex = 0;

  this.speed = this.properties.speed || 200;
  this.animation_speed = this.speed / this.movement["left"].length;
  this.animation_step_size = 1 / this.movement["left"].length;

  if(this.properties.source){
    var _this = this;
    this.spritesheet = new SpriteSheet(this.tilewidth, this.tileheight);
    this.spritesheet.add_image({image: this.properties.source}, function(){
      if(next){next(_this);}
    });
  }else{
    this.spritesheet = this.map.spritesheet;
    if(next){next(this);}
  }
};

Displayable.prototype.draw = function(ctx, deltatime, x, y){
  x = x || this.x;
  y = y || this.y;

  var draw_x = ((x * this.map_tile_width)  - this.offset_x),
      draw_y = ((y * this.map_tile_height) - this.offset_y);

  this.animate(deltatime);

  var draw_frame = this._get_frame();
  if(draw_frame){
    ctx.drawImage(draw_frame, draw_x - (ctx.viewport.x * this.map_tile_width), draw_y - (ctx.viewport.y * this.map_tile_height));
  }
};

Displayable.prototype.teleport = function(x, y){
  this.is_moving = false
  this.x = x;
  this.y = y;
};

Displayable.prototype.kill = function(){
  delete this.layer.objects[this.id || this.name];
  delete this.map.objects[this.id || this.name];
};

Displayable.prototype.move_to = function(to_x, to_y){
  var direction = "",
      distance = 0;
  if (this.x != to_x) {
    direction = (this.x < to_x) ? "right" : "left";
    distance = Math.abs(this.x - to_x);
  } else {
    direction = (this.y < to_y) ? "down" : "up";
    distance = Math.abs(this.y - to_y);
  }
  this.move(direction, distance);
};

Displayable.prototype.move = function(direction, distance){
  this.distance = distance || 1;
  if(this.is_moving || this.is_interacting){ return false; }

  this.currentMovement = direction;
  this.movementIndex = 0;

  if(this._facing_solid_tile(direction)){
    return false
  }

  this.is_moving = true;
  return true
};

Displayable.prototype.animate = function(deltatime){
  if(this.is_moving){
    if((this.frame_time += deltatime) >= this.animation_speed){
      var number_of_steps = (this.frame_time / this.animation_speed) | 0;

      this.movementIndex += number_of_steps;
      switch(this.currentMovement){
        case "left":  this.x -= this.animation_step_size * number_of_steps; break;
        case "right": this.x += this.animation_step_size * number_of_steps; break;
        case "up":    this.y -= this.animation_step_size * number_of_steps; break;
        case "down":  this.y += this.animation_step_size * number_of_steps; break;
      }
      if(this.movementIndex >= this.movement[this.currentMovement].length){
        //set our destination as whole values because the step size might be just out a bit
        this.x = Grouter.normalize_coord(this.to_x, this.map.width);
        this.y = Grouter.normalize_coord(this.to_y, this.map.height);

        //reset animation
        this.movementIndex = 0;
        this.is_moving = false;
        this.do_tile_actions();
        //if the distance is set that means keep walking
        if(this.distance > 1){
          this.move(this.currentMovement, --this.distance);
        }
      }
      this.frame_time = 0;
    }
  }else{
    //do idle animations
  }
};

//@OVERRIDE this just make sure the displayable is facing the speaker/actor
Displayable.prototype.react = function(actor){
  switch(actor.currentMovement){
    case "left":  this.currentMovement = "right"; break;
    case "right": this.currentMovement = "left"; break;
    case "up":    this.currentMovement = "down"; break;
    case "down":  this.currentMovement = "up"; break;
  }

  //call Super
  this.constructor.prototype.react.call(this, actor);
};

Displayable.prototype._get_frame = function(){
  var sprite = this.spritesheet.get(this.movement[this.currentMovement][this.movementIndex]);
  return sprite ? sprite.img : null;
};

//we set to_x and to_y here so that the animation has a defined end so we dont get rounding
//problems if the animation step is off by decimals, we round x and y to make sure are on the grid
//at the end of the animation
Displayable.prototype._get_to_tile = function(direction){
  var to_tile;

  if(this.is_moving){
    to_tile = this.map.at(this.to_x, this.to_y, this.layer.group);
    to_tile.x = this.to_x;
    to_tile.y = this.to_y;
  }else{
    var next_x = this.x,
        next_y = this.y;

    switch(direction || this.currentMovement){
      case "left":  next_x--; break;
      case "right": next_x++; break;
      case "up":    next_y--; break;
      case "down":  next_y++; break;
    }

    to_tile = this.map.at(next_x, next_y, this.layer.group);
    this.to_x = to_tile.x = next_x;
    this.to_y = to_tile.y = next_y;
  }

  return to_tile;
};

Displayable.prototype._facing_solid_tile = function(direction){
  var to_tile = this._get_to_tile(direction);
  if(to_tile.objects.length > 0 || to_tile.tiles.length == 0){
    return true;
  }
  for(var i = 0; i < to_tile.tiles.length; i++){
    if(to_tile.tiles[i].properties.solid){
      return true;
    }
  }
  return false;
};

Displayable.prototype.do_tile_actions = function(){
  var to_tile = this.map.at(this.x, this.y, this.layer.group);
  for(var i=0; i < to_tile.tiles.length; i++){
    var tile = to_tile.tiles[i];
    if(tile.properties.stair_up){
      this.stair_up()
    }
    if(tile.properties.stair_down){
      this.stair_down()
    }
  }
}

Displayable.prototype.stair_down = function(){
  this.set_layer(this.next_layer(false));
}

Displayable.prototype.stair_up = function(){
  this.set_layer(this.next_layer(true));
}

Displayable.prototype.next_layer = function(up){
  var current_layer = this.layer,
      current_found = false,
      next_layer,
      keys = Object.keys(this.map.layers),
      from = (up ? 0 : (keys.length -1)),
      to = (up ? (keys.length -1) : 0);

  for(var i = from; i != to; (up ? i++ : i--)){
    var layer = this.map.layers[keys[i]];
    if(current_found && layer.is_objectgroup()){
      next_layer = layer;
      break;
    }
    if(layer == current_layer){
      current_found = true;
    }
  }
  return next_layer;
}

Displayable.prototype.set_layer = function(layer, skip_socket){
  if(!layer || layer == this.layer){ return; }
  var current_layer = this.layer;
  layer.objects[this.id] = this;
  delete current_layer.objects[this.id]
  this.layer = layer;
  if(!skip_socket && this.socket && this.is_player) {
    this.socket.emit("player change layer", layer.name);
  }
}
