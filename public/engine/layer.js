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
    this.initiate_objects(layer_options.objects);
  }
  
  if(next){
    next(this);
  }
}

Layer.prototype.is_tilelayer = function(){
  return this.type == "tilelayer";
};

Layer.prototype.is_objectgroup = function(){
  return this.type == "objectgroup";
};

Layer.prototype.initiate_objects = function(objects){
  for(var i = 0; i < objects.length; i++){
    var object = objects[i];
    if(object.type.toLowerCase() == "player"){
      object.layer = this;
      this.map.player = object;//set it to inital object so we have a starting x y to render
    }else if(object.type.toLowerCase() == "actionable"){
      var actionable = new Actionable(object, this.map, this);
      this.map.objects[actionable.name] = this.objects[actionable.name] = actionable;
    }
  }
};

Layer.prototype.unload = function(){
  if(this.is_objectgroup()){
    var object_name, object;
    for(object_name in this.objects){
      this.objects[object_name].unload();
    }
  }
}

Layer.prototype.get_tile_index = function(x, y) {
  var sphere_x = Grouter.normalize_coord(x, this.width),
      sphere_y = Grouter.normalize_coord(y, this.height);
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
        from_x = ctx.camera.left(),
        from_y = ctx.camera.top(),
        to_x = ctx.camera.right(),
        to_y = ctx.camera.bottom();

    //we only draw the screen rather than culling just draw screen range
    for (y = from_y; y < to_y; y++) {
      for (x = from_x; x < to_x; x++) {
        var tile = this.map.spritesheet.get(this.get_tile_index(x, y));
        if(tile){
          var draw_x = (Math.floor(x) * tile_width),
              draw_y = (Math.floor(y) * tile_height);
          tile.draw(ctx, draw_x - (ctx.camera.x * tile_width), draw_y - (ctx.camera.y * tile_height));
        }
      }
    }
  }else if(this.is_objectgroup() && this.visible && this.map.player.layer.group == this.group){
    var object_name, object, object_pos;
    for(object_name in this.objects){
      object = this.objects[object_name];
      if(object.type == 'player'){
        object.draw(ctx);
      }else if(object.type == 'npc' && (object_pos = ctx.camera.isInside(object.x, object.y, this))){
        object.draw(ctx, object_pos[0], object_pos[1]);
      }
    }
  }
};
