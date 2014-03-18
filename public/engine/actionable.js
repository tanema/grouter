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
    this.socket = this.map.engine.socket.of(this.map.name+(this.id || this.name));
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

  if(this.action_sound){
    this.map.audio_manager.play(this.action_sound);
  }
  this.map.director.act(this, actor)
};
