function Layer(layer_options, map, next){
  this.name = layer_options.name;
  this.type = layer_options.type;
  this.properties = layer_options.properties || {};
  this.group = this.properties.group;

  this.opacity = layer_options.opacity;
  this.visible = layer_options.visible;

  this.data = layer_options.data;
  this.objects = {};

  this.x = layer_options.x;
  this.y = layer_options.y;
  this.width = layer_options.width;
  this.height = layer_options.height;

  this.map = map;

  if(this.is_objectgroup()){
    this._initiate_objects(layer_options.objects, next);
  }else if(next){
    next(this);
  }
}

Layer.prototype.is_tilelayer = function(){
  return this.type == "tilelayer";
};

Layer.prototype.is_objectgroup = function(){
  return this.type == "objectgroup";
};

Layer.prototype._initiate_objects = function(objects, next){
  if(objects.length === 0){return next(this);}

  var _this = this,
      object = objects.shift();

  if(object.type.toLowerCase() == "player"){
    new Player(object, _this.map, _this, function(player){
      _this.map.player = _this.map.objects[player.id] = _this.objects[player.id] = player;
      _this._initiate_objects(objects, next);
    });
  }else if(object.type.toLowerCase() == "npc"){
    new Npc(object, _this.map, _this, function(npc){
      _this.map.objects[npc.name] = _this.objects[npc.name] = npc;
      _this._initiate_objects(objects, next);
    });
  }else if(object.type.toLowerCase() == "actionable"){
    var actionable = new Actionable(object, _this.map, _this);
    _this.map.objects[actionable.name] = _this.objects[actionable.name] = actionable;
    _this._initiate_objects(objects, next);
  }else{
    _this._initiate_objects(objects, next);
  }
};

Layer.prototype.get_tile_index = function(x, y) {
  var sphere_x = normalize_coord(x, this.width),
      sphere_y = normalize_coord(y, this.height);
  return this.data[(sphere_x + sphere_y * this.width)]
}

// TODO maybe: layers have x,y offset but I have not seen how tiled uses them
Layer.prototype.draw = function(ctx, deltatime){
  //set layer opacity
  ctx.globalAlpha = this.opacity;
  if(this.is_tilelayer() && this.visible && this.map.player.layer.group == this.group){
    var x, y,
        tile_height = this.map.spritesheet.tile_height,
        tile_width  = this.map.spritesheet.tile_width,
        from_x = ctx.viewport.left(),
        from_y = ctx.viewport.top(),
        to_x = ctx.viewport.right(),
        to_y = ctx.viewport.bottom();

    //we only draw the screen rather than culling just draw screen range
    for (y = from_y; y < to_y; y++) {
      for (x = from_x; x < to_x; x++) {
        var tile = this.map.spritesheet.get(this.get_tile_index(x, y)),
            draw_x, draw_y;
        if(tile){
          if(ctx.orientation == "isometric"){
            draw_x = ( Math.floor(x) * tile_width/2  - y * tile_width/2  );
            draw_y = ( Math.floor(y) * tile_height/2 + x * tile_height/2 );
          }else if (ctx.orientation == "orthogonal"){
            draw_x = (Math.floor(x) * tile_width);
            draw_y = (Math.floor(y) * tile_height);
          }
          tile.draw(ctx, draw_x - (ctx.viewport.x * tile_width), draw_y - (ctx.viewport.y * tile_height));
        }
      }
    }
  }else if(this.is_objectgroup() && this.visible && this.map.player.layer.group == this.group){
    var object_name, object;
    for(object_name in this.objects){
      object = this.objects[object_name];
      if(object.type == 'player'){
        object.draw(ctx, deltatime);
      }else if(object.type == 'npc' && ctx.viewport.isInside(object.x, object.y)){
        object.draw(ctx, deltatime);
      }else if(object.type == 'npc'){ //this means it is not in viewport
        object.animate(deltatime);    // update position 
      }
    }
  }else if(this.is_objectgroup()){ //object group that is not in the displayable group
    var object_name, object;
    for(object_name in this.objects){
      object = this.objects[object_name];
      if(object.type == 'npc'){
        object.animate(deltatime);// update position 
      }
    }
  }
};
