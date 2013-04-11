function Map(map_src, engine){
  this.map_src = map_src;
  this.engine = engine;
  this.layers = {};
  this.player = null;
  this.objects = {};
  this.audio_manager = new AudioManager();
  this.dialog = new Dialog();
  this.name = map_src.substr(map_src.lastIndexOf("/")+1);
}

Map.prototype.load = function (next){
  var _this = this, i;

  console.log("["+ _this.map_src + "] getting from server");
  $.getJSON(this.map_src, function(map_data){
    _this.properties = map_data.properties || {};
    _this.orientation = map_data.orientation;

    if(_this.properties.music){
      var sound = _this.audio_manager.load_music(_this.properties.music);
      _this.audio_manager.loop(sound);
    }

    console.log("["+ _this.map_src + "] loading " + map_data.tilesets.length + " tileset(s)");
    //load tilesets
    _this.spritesheet = new SpriteSheet(map_data.tilewidth, map_data.tileheight);
    _this._load_tileset(map_data.tilesets, function(){
      console.log("["+ _this.map_src + "] spritesheet loaded: " + _this.spritesheet.loaded());
      console.log("["+ _this.map_src + "] setting up " + map_data.layers.length + " layer(s)");
      //load layers
      _this._load_layer(map_data.layers, function(){
        console.log("["+ _this.map_src + "] finished loading");
        //do socket stuff
        _this.register_socket_events();
        _this.engine.socket.emit("join map", _this.name, _this.player.layer.name, _this.player.name, _this.player.properties);
        // map loaded so continue
        if(next){
          next(_this);
        }
      });
    });
  });
};

Map.prototype.register_socket_events = function(){
  var _this = this;
  this.engine.socket.on('spawn player', function(options){_this.player_spawn(options);});
  this.engine.socket.on('spawn npc', function(options){_this.npc_spawn(options);});
  this.engine.socket.on('kill player', function(id){_this.npc_killed(id);});
  this.engine.socket.on('kill npc', function(name){_this.npc_killed(name);});
  this.engine.socket.on('actor move', function(id, direction, distance){_this.actor_move(id, direction, distance);});
};

Map.prototype.loaded = function (){
  return this.spritesheet.loaded();
};

Map.prototype._load_tileset = function(tilesets, next){
  if(tilesets.length === 0){return next();}
  var _this = this;
  this.spritesheet.add_image(tilesets[0], function(){
    tilesets.shift();
    _this._load_tileset(tilesets, next);
  });
};

Map.prototype._load_layer = function(layers, next){
  if(layers.length === 0){return next();}
  var _this = this;
  new Layer(layers[0], _this, function(layer){
    _this.layers[layer.name] = layer;
    layers.shift();
    _this._load_layer(layers, next);
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

Map.prototype.draw = function (ctx, deltatime){
  //default background, using css
  $(ctx.canvas).css("background", this.properties.background);

  //update the spritesheet(animated tiles) for this frame
  this.spritesheet.update(deltatime);

  //set viewport x,y from player
  ctx.viewport.x = this.player.x - (ctx.screen.width  - this.spritesheet.tile_width) / (this.spritesheet.tile_width * 2);
  ctx.viewport.y = this.player.y - (ctx.screen.height - this.spritesheet.tile_height) / (this.spritesheet.tile_height * 2);

  var layer_name;
  for(layer_name in this.layers){
    this.layers[layer_name].draw(ctx, deltatime);
  }

  this.dialog.draw(ctx);
};

Map.prototype.player_spawn = function(options){
  if(options.id == this.player.id){return;}
  console.log("Spawning player " + options.id);

  var _this = this;
  var layer = this.layers[options.layer_name];
  new Npc(options, this, layer, function(npc){
    _this.objects[npc.id] = npc;
    layer.objects[npc.id] = npc;
  });
};

Map.prototype.npc_spawn = function(options){
  console.log("Spawning npc " + options.name);
};

Map.prototype.player_killed = function(id){
  console.log("Killing player " + id);
  if(this.objects[id]){
    delete this.objects[id].layer.objects[id];
    delete this.objects[id];
  }
};

Map.prototype.npc_killed = function(name){
  console.log("Killing npc " + name);
  if(this.objects[name]){
    delete this.objects[name].layer.objects[name];
    delete this.objects[name];
  }
};

Map.prototype.actor_move = function(id, direction, distance){
  this.objects[id].move(direction, distance);
};