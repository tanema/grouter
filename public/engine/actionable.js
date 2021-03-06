function Actionable(actionable_options, map, layer){
  actionable_options = actionable_options || {};
  this.map = map || {};
  this.is_busy = false
  this.name = actionable_options.name;
  this.layer = layer;
  this.type = actionable_options.type;
  this.x = actionable_options.x || 0;
  this.y = actionable_options.y || 0;

  if(map){
    //convert x and y to tile co-ords because tiled gives objects in absolute co-ords
    this.x = this.x / map.spritesheet.tile_width;
    this.y = this.y / map.spritesheet.tile_height;
    //set socket to be for only this object
    //at this point the map socket is not setup yet
    this.channel = this.map.name+(this.id || this.name); 
    this.socket = this.map.engine.socket.of(this.channel);

    var _this = this;
    this.socket.on('interacting started', function(){ _this.busy = true});
    this.socket.on('interacting finished', function(){ _this.busy = false});
  }

  if(actionable_options.properties){
    if(actionable_options.properties.action_sound){
      this.action_sound = this.map.audio_manager.load_sfx(actionable_options.properties.action_sound);
    }
  }
  this.properties = actionable_options.properties || {};
}

Actionable.prototype.unload = function(){ }

Actionable.prototype.react = function(actor){
  if(this.is_busy){return;}

  this.socket.emit("interacting started");
  if(this.action_sound){
    this.map.audio_manager.play(this.action_sound);
  }

  var _this = this;
  this.is_busy = actor.is_busy = true;
  this.map.director.act(this, function(){
    _this.is_busy = actor.is_busy = false;
    _this.socket.emit("interacting finished");
  })
};

Actionable.prototype.play_action_sound = function(){
  if(this.action_sound){
    this.action_sound.play()
  }
}

Actionable.prototype.on_enter = function(layer){
  switch(this.properties.on_enter){
    case "stair_up":
      layer.stair_up();
      this.play_action_sound();
      break;
    case "stair_down":
      layer.stair_down()
      this.play_action_sound();
      break;
    case "load_map":
      this.map.engine(this.properties.map_name)
      break;
  }
}


Actionable.prototype.on_leave = function(layer){
  switch(this.properties.on_enter){
  }
}
