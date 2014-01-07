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
    _this.tilewidth = map_data.tilewidth;
    _this.tileheight = map_data.tileheight;
    _this.width = map_data.width;
    _this.height = map_data.height;

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
        if(Grouter.ServerEnabled){
          _this.register_socket_events();
          _this.engine.socket.emit("join map", _this.name, _this.player.name);
        }
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
  this.engine.socket.on('player connected', function(x, y){_this.player_connected(x, y);});
  this.engine.socket.on('spawn player', function(options){_this.player_spawn(options);});
  this.engine.socket.on('spawn npc', function(options){_this.npc_spawn(options);});
  this.engine.socket.on('kill player', function(id){_this.npc_killed(id);});
  this.engine.socket.on('kill npc', function(name){_this.npc_killed(name);});
  this.engine.socket.on('actor move', function(id, to_x, to_y){_this.actor_move(id, to_x, to_y);});
  this.engine.socket.on('actor teleport', function(id, to_x, to_y){_this.actor_teleport(id, to_x, to_y);});
  this.engine.socket.on('actor change layer', function(id, layer){_this.actor_change_layer(id, layer);});
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
  var results = {tiles: [], objects: []};

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

Map.prototype.player_connected = function(connection_data){
  //handle player connection
  this.player.id = connection_data.player.id;
  this.player.teleport(connection_data.player.x, connection_data.player.y, true);
  for(var player_id in connection_data.players){
    this.player_spawn(connection_data.players[player_id]);
  }
  for(var npc_id in connection_data.npcs){
    this.npc_spawn(connection_data.npcs[npc_id]);
  }
};

Map.prototype.player_spawn = function(options){
  console.log("Spawning player " + options.id + " at " + options.x + "," + options.y);
  var _this = this;
  var layer = this.layers[options.layer_name];
  //convert tile coords to abs coords for init
  options.x = options.x * this.tilewidth;
  options.y = options.y * this.tileheight;
  new Npc(options, this, layer, function(npc){
    _this.objects[npc.id] = npc;
    layer.objects[npc.id] = npc;
  });
};

Map.prototype.npc_spawn = function(options){
  console.log("Spawning npc " + options.name);
  this.objects[options.name].teleport(options.x, options.y);
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

Map.prototype.actor_teleport = function(id, to_x, to_y){
  console.log("actor teleport")
  this.objects[id].teleport(to_x, to_y);
}

Map.prototype.actor_move = function(id, to_x, to_y){
  console.log("actor move: " + id);
  var direction = "",
      distance = 0;
  if (this.objects[id].x != to_x) {
    direction = (this.objects[id].x < to_x) ? "right" : "left";
    distance = Math.abs(this.objects[id].x - to_x);
  } else {
    direction = (this.objects[id].y < to_y) ? "down" : "up";
    distance = Math.abs(this.objects[id].y - to_y);
  }
  this.objects[id].move(direction, distance);
};

Map.prototype.actor_change_layer = function(id, layer_name){
  console.log("actor " + id + " change layer to " + layer_name);
  for(var layer in this.layers){
    if(layer == layer_name){
      this.objects[id].set_layer(this.layers[layer], true);
      break;
    }
  }
}
