function Actionable(actionable_options, map){
  actionable_options = actionable_options || {};
  this.map = map || {};
  this.name = actionable_options.name;
  this.x = actionable_options.x || 0;
  this.y = actionable_options.y || 0;
  this.audio_manager = new AudioManager();

  if(map){
    //convert x and y to tile co-ords because tiled gives objects in absolute co-ords
    this.x = this.x / map.spritesheet.tile_width;
    this.y = this.y / map.spritesheet.tile_height;
  }

  if(actionable_options.properties){
    this.action = actionable_options.properties.action;

    if(actionable_options.properties.action_sound){
      this.action_sound = this.audio_manager.load_src(actionable_options.properties.action_sound);
    }
  }
}

Actionable.prototype.react = function(){
  if(this.action){

    if(this.action_sound){
      this.audio_manager.play(this.action_sound);
    }

    this._eval_script(this.action);
  }
};

Actionable.prototype._eval_script = function(script){
  var me = this,
      player = this.map.player;
  eval("(function eval_csf(me, player){" + script + "})( me, player );");
};