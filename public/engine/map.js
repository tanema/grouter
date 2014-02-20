function Map(map_src, engine){
  this.map_src = map_src;
  this.engine = engine;
  this.layers = {};
  this.player = null;
  this.objects = {};
  this.audio_manager = new AudioManager();
  this.dialog = new Dialog();
  this.name = map_src.substring(map_src.lastIndexOf("/")+1, map_src.lastIndexOf("."));
}

Map.prototype.load = function (next){
  var _this = this, i;

  console.log("["+ _this.map_src + "] getting from server");
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
        _this.socket = _this.engine.socket.of(_this.name);
        _this.register_socket_events();
        _this.register_keyboard_events();
        // map loaded so continue
        if(next){
          next(_this);
        }
      });
    });
  });
};

Map.prototype.register_keyboard_events = function(){
  Grouter.bind_event("keypress_up keypress_down keypress_left keypress_right", this.user_arrow, this);
  Grouter.bind_event("keypress_z", this.user_interact, this);
}

Map.prototype.user_arrow = function(e){
  if(this.dialog.is_talking){
    this.dialog.user_arrow(e)
  } else {
    this.player.user_move(e)
  }
}

Map.prototype.user_interact = function(e){
  if(this.dialog.is_talking){
    this.dialog.user_action(e)
  } else {
    this.player.user_interact(e)
  }
}

Map.prototype.register_socket_events = function(){
  var _this = this;
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
  ctx.canvas.style.background = this.properties.background

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
  var layer = this.layers[connection_data.player.layer_name];
  connection_data.player.x = connection_data.player.x * this.tilewidth;
  connection_data.player.y = connection_data.player.y * this.tileheight;
  this.player = this.objects[connection_data.player.id] = layer.objects[connection_data.player.id] = new Player(connection_data.player, this, layer);
  for(var player_id in connection_data.players){
    this.npc_spawn(connection_data.players[player_id]);
  }
  for(var npc_id in connection_data.npcs){
    this.npc_spawn(connection_data.npcs[npc_id]);
  }
};

Map.prototype.npc_spawn = function(options){
  console.log("Spawning " + (options.id || options.name) + " at " + options.x + "," + options.y);
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
