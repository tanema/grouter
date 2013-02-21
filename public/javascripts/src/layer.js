function Layer(layer_options, map, next){
  this.name = layer_options.name;
  this.type = layer_options.type;
  this.properties = layer_options.properties || {};

  this.opacity = layer_options.opacity;
  this.visible = layer_options.visible;

  this.data = layer_options.data;
  this.objects = [];

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
    new Player(object, _this.map, function(player){
      _this.map.player = player;
      _this.objects.push(player);
      _this._initiate_objects(objects, next);
    });
  }else if(object.type.toLowerCase() == "npc"){
    new Npc(object, _this.map, function(npc){
      _this.map.npcs.push(npc);
      _this.objects.push(npc);
      _this._initiate_objects(objects, next);
    });
  }else if(object.type.toLowerCase() == "actionable"){
    _this.objects.push(new Actionable(object, _this.map));
    _this._initiate_objects(objects, next);
  }else{
    _this._initiate_objects(objects, next);
  }
};

Layer.prototype.draw = function(ctx){
  if(!this.visible){return;}

  //set layer opacity
  ctx.globalAlpha = this.opacity;

  if(this.is_tilelayer()){
    var x, y,
        tile_height = this.map.spritesheet.tile_height,
        tile_width  = this.map.spritesheet.tile_width,
        from_x = ctx.viewport.left(),
        from_y = ctx.viewport.top(),
        to_x = ctx.viewport.right(),
        to_y = ctx.viewport.bottom();

    for (y = from_y; y < to_y; y++) {
      for (x = from_x; x < to_x; x++) {

        var this_x = Math.floor(x),
            this_y = Math.floor(y),
            tile = this.map.spritesheet.get(this.data[(this_x + this_y * this.width)]),
            draw_x, draw_y;

        if(ctx.orientation == "isometric"){
          draw_x = (300 + x * tile_width/2 - y * tile_width/2);
          draw_y = (y * tile_height/2 + x * tile_height/2);
        }else if (ctx.orientation == "orthogonal"){
          draw_x = (this_x * tile_width);
          draw_y = (this_y * tile_height);
        }

        if(tile){
          ctx.drawImage(tile.img, draw_x - (ctx.viewport.x * tile_width), draw_y - (ctx.viewport.y * tile_height));
        }
      }
    }
  }else if(this.is_objectgroup()){
    for(var i=0; i<this.objects.length; i++){
      if(this.objects[i].type == 'player'){
        this.objects[i].draw(ctx);
      }else if(this.objects[i].type == 'npc' && ctx.viewport.isInside(this.objects[i].x, this.objects[i].y)){
        this.objects[i].draw(ctx);
      }
    }
  }

};