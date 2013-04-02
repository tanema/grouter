function Map(map_src, engine){
  this.map_src = map_src;
  this.engine = engine;
  this.layers = {};
  this.player = null;
  this.objects = {};
  this.audio_manager = new AudioManager("music");
  this.dialog = new Dialog();
}

Map.prototype.load = function (next){
  var _map = this, i;

  console.log("loading map " + this.map_src + " ...");
  $.getJSON(this.map_src, function(map_data){
    _map.data = map_data;
    _map.properties = map_data.properties || {};
    _map.orientation = map_data.orientation;

    if(_map.properties.music){
      var sound = _map.audio_manager.load_src(_map.properties.music);
      _map.audio_manager.loop(sound);
    }

    console.log("["+ _map.map_src + "] loading " + map_data.tilesets.length + " tileset(s)");
    //load tilesets
    _map.spritesheet = new SpriteSheet(map_data.tilewidth, map_data.tileheight);
    _map._load_tileset(map_data.tilesets, function(){
      console.log("["+ _map.map_src + "] all loaded: " + _map.spritesheet.loaded());
      console.log("["+ _map.map_src + "] setting up " + map_data.layers.length + " layer(s)");
      //load layers
      _map._load_layer(map_data.layers, function(){
        console.log("finished loading map " + _map.map_src);
        // map loaded so continue
        if(next)
          next();
      });
    });
  });
};

Map.prototype.loaded = function (){
  return this.spritesheet.loaded();
};

Map.prototype._load_tileset = function(tilesets, next){
  if(tilesets.length === 0){return next();}
  var _map = this;
  this.spritesheet.add_image(tilesets[0], function(){
    tilesets.shift();
    _map._load_tileset(tilesets, next);
  });
};

Map.prototype._load_layer = function(layers, next){
  if(layers.length === 0){return next();}
  var _map = this;
  new Layer(_map.data.layers[0], _map, function(layer){
    _map.layers[layer.name] = layer;
    layers.shift();
    _map._load_layer(layers, next);
  });
};

Map.prototype.at = function(x,y){
  var results = {tiles: [], objects: []};

  var layer_name;
  for(layer_name in this.layers){
    var layer = this.layers[layer_name];
    if(layer.is_tilelayer()){
      var tile = this.spritesheet.get(layer.data[(x + y * layer.width)]);
      if(tile){
        results.tiles.push(tile);
      }
    }else if(layer.is_objectgroup()){
      var object_name, object;
      for(object_name in layer.objects){
        object = layer.objects[object_name];
        if(object && object.x === x && object.y === y){
          results.objects.push(object);
        }
      }
    }
  }

  return results;
};

Map.prototype.draw = function (ctx){
  //default background, using css
  $(ctx.canvas).css("background", this.properties.background);

  //set viewport x,y from player
  ctx.viewport.x = this.player.x - (ctx.screen.width  - this.spritesheet.tile_width) / (this.spritesheet.tile_width * 2);
  ctx.viewport.y = this.player.y - (ctx.screen.height - this.spritesheet.tile_height) / (this.spritesheet.tile_height * 2);

  var layer_name;
  for(layer_name in this.layers){
    this.layers[layer_name].draw(ctx);
  }

  this.dialog.draw(ctx);
};

Map.prototype.player_spawn = function(id, name, player_data, layer){

};
Map.prototype.npc_spawn = function(layer, character_name, character_data){

};