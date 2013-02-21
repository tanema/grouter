function Displayable(display_object_options, map, next){
  display_object_options = display_object_options || {};
  this.map = map || {};
  this.type = display_object_options.type;
  this.properties = display_object_options.properties || {};

  Actionable.call(this, display_object_options, map);

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

  this.currentMovement = "idle";
  this.movementIndex = 0;

  this.script = this.properties.script;
  this.speed = this.properties.speed || 100;
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

Displayable.prototype.draw = function(ctx){
  var draw_x, draw_y;

  if(ctx.orientation == "isometric"){
    draw_x = ((300 + this.x * this.map_tile_width/2 - this.y * this.map_tile_width/2) - this.offset_x);
    draw_y = ((this.y * this.map_tile_height/2 + this.x * this.map_tile_height/2) - this.offset_y);
  }else if (ctx.orientation == "orthogonal"){
    draw_x = ((this.x * this.map_tile_width)  - this.offset_x);
    draw_y = ((this.y * this.map_tile_height) - this.offset_y);
  }

  if(this.type == "player"){
    ctx.drawImage(this._get_frame(), draw_x, draw_y);
  }else{
    ctx.drawImage(this._get_frame(), draw_x - (ctx.viewport.x * this.map_tile_width), draw_y - (ctx.viewport.y * this.map_tile_height));
  }

};

Displayable.prototype.move = function(direction, distance){
  distance = distance || 1;
  if(this.is_moving){ return; }

  this.currentMovement = direction;
  this.movementIndex = 0;

  if(this._facing_solid_tile()){
    $(document).trigger("redraw");
    return;
  }

  this.is_moving = true;
  this.animate(direction, distance);
};

Displayable.prototype.animate = function(direction, distance){
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
    if(distance > 1){
      this.move(direction, distance--);
    }else{
      this.is_moving = false;
    }
  }else{
    var _this = this;
    setTimeout(function(){
      _this.animate(direction, distance);
    }, this.animation_speed);
  }
  $(document).trigger("redraw");
};

Displayable.prototype._get_frame = function(ctx){
  return this.spritesheet.get(this.movement[this.currentMovement][this.movementIndex]).img;
};

//we set to_x and to_y here so that the animation has a defined end so we dont get rounding
//problems if the animation step is off by decimals, we round x and y to make sure are on the grid
//at the end of the animation
Displayable.prototype._get_to_tile = function(){
  var next_x = this.x | 0,
      next_y = this.y | 0;

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

Displayable.prototype._facing_solid_tile = function(){
  var to_tile = this._get_to_tile();
  if(to_tile.objects.length){
    return true;
  }
  for(var i = 0; i < to_tile.tiles.length; i++){
    if(to_tile.tiles[i].properties.solid){
      return true;
    }
  }
  return false;
};