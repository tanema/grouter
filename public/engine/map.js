function Map(map_src, engine){
  this.map_src = map_src;
  this.engine = engine;
  this.layers = {};
  this.player = null;
  this.camera = null;
  this.sprites = {};
  this.actors = {};
  this.audio_manager = new AudioManager();
  this.name = map_src.substring(map_src.lastIndexOf("/")+1, map_src.lastIndexOf("."));
}

Map.prototype.load = function (next){
  var _this = this, i;

  console.log("["+ _this.map_src + "] Loading");
  Grouter.getJSON(this.map_src, function(map_data){
    _this.properties = map_data.properties || {};
    _this.orientation = map_data.orientation;
    _this.tilewidth = map_data.tilewidth;
    _this.tileheight = map_data.tileheight;
    _this.width = map_data.width;
    _this.height = map_data.height;

    if(_this.properties.music){
      var sound = _this.audio_manager.load_music(_this.properties.music);
      _this.audio_manager.loop(sound);
    }

    console.log(" → loading " + map_data.tilesets.length + " tileset(s)");
    _this.spritesheet = new SpriteSheet(map_data.tilewidth, map_data.tileheight);
    _this._load_tileset(map_data.tilesets, function(){
      console.log(" → spritesheet loaded: " + _this.spritesheet.loaded());
      console.log(" → setting up " + map_data.layers.length + " layer(s)");
      _this._load_layer(map_data.layers, function() {   
        _this.register_socket_events();
        _this.register_keyboard_events();
        console.log(" → loading script " + _this.map_src.replace(".json", "") + "/script.json ...");
        Grouter.getJSON(_this.map_src.replace(".json", "")+"/script.json", function(script_data){
          _this.director = new Director(_this, script_data);
          console.log(" → finished loading map data");
          if(next){// everything loaded so continue 
            next(_this);
          }
        });
      });
    });
  });
};

Map.prototype.unload = function (){
  this.spritesheet.unload();
  for(layer_name in this.layers){
    this.layers[layer_name].unload();
  }
}

Map.prototype.register_keyboard_events = function(){
  Grouter.bind_event("keypress_up keypress_down keypress_left keypress_right", this.user_arrow, this);
  Grouter.bind_event("gamepad_dpad_up gamepad_dpad_down gamepad_dpad_left gamepad_dpad_right", this.user_arrow, this);
  Grouter.bind_event("keypress_z gamepad_a", this.user_interact, this);
}

Map.prototype.user_arrow = function(e){
  if(this.director.current_scene){
    this.director.user_arrow(e)
  } else {
    this.player.user_move(e)
  }
}

Map.prototype.user_interact = function(e){
  if(this.director.current_scene){
    this.director.user_action(e)
  } else {
    this.player.user_interact(e)
  }
}

Map.prototype.register_socket_events = function(){
  var _this = this;
  console.log(" → connecting to sockets");
  this.socket = this.engine.socket.of(this.name);
  this.socket.on('player connected', function(x, y){_this.player_connected(x, y);});
  this.socket.on('spawn', function(options){_this.npc_spawn(options);});
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

Map.prototype.at = function(x, y, group){
  var results = {tiles: [], sprites: [], actors: []};

  var layer_name;
  for(layer_name in this.layers){
    var layer = this.layers[layer_name];

    if(!layer.visible || group != layer.group){
      continue;
    }

    if(layer.is_tilelayer()){
      var tile = this.spritesheet.get(layer.get_tile_index(x, y));
      if(tile){
        results.tiles.push(tile);
      }
    }else if(layer.is_objectgroup()){
      var object_name, object;
      for(object_name in layer.sprites){
        object = layer.sprites[object_name];
        if(object && object.x === x && object.y === y){
          results.sprites.push(object);
        }
      }
      for(object_name in layer.actors){
        object = layer.actors[object_name];
        if(object && object.x === x && object.y === y){
          results.actors.push(object);
        }
      }
    }
  }

  return results;
};

Map.prototype.draw = function (ctx, deltatime){
  //default background, using css
  ctx.canvas.style.background = this.properties.background

  //set camera x,y from player
  if(!this.director.current_scene){
    this.camera.set(this.player.x, this.player.y);
  }

  var layer_name;
  for(layer_name in this.layers){
    this.layers[layer_name].draw(ctx, deltatime);
  }

  this.director.draw(ctx);
};

Map.prototype.player_connected = function(connection_data){
  //handle player connection
  var layer = this.layers[connection_data.player.layer_name];
  connection_data.player.x = connection_data.player.x * this.tilewidth;
  connection_data.player.y = connection_data.player.y * this.tileheight;
  this.player = this.sprites[connection_data.player.id] = layer.sprites[connection_data.player.id] = new Player(connection_data.player, this, layer);
  for(var player_id in connection_data.players){
    this.npc_spawn(connection_data.players[player_id]);
  }
  for(var npc_id in connection_data.npcs){
    this.npc_spawn(connection_data.npcs[npc_id]);
  }
};

Map.prototype.npc_spawn = function(options){
  console.log(" → spawning " + (options.id || options.name) + " at " + options.x + "," + options.y);
  var _this = this;
  var layer = this.layers[options.layer_name];
  //convert tile coords to abs coords for init
  options.x = options.x * this.tilewidth;
  options.y = options.y * this.tileheight;
  new Npc(options, this, layer, function(npc){
    _this.sprites[npc.id || npc.name] = npc;
    layer.sprites[npc.id || npc.name] = npc;
  });
};
