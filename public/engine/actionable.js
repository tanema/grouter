function Actionable(actionable_options, map, layer){
  actionable_options = actionable_options || {};
  this.map = map || {};
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
    if(actionable_options.properties.action){
      this.action = actionable_options.properties.action;
    }else if(actionable_options.properties.enter_action){
      this.enter_action = actionable_options.properties.enter_action;
    }else if(actionable_options.properties.action_src){
      var _this = this;
      console.log(" → loading actionable's reaction " + actionable_options.properties.action_src);
      $.ajax({
        url: actionable_options.properties.action_src,
        dataType: 'text', // have to set as text otherwise get ref errors from me/dialog/ect
        success: function(data){_this.action = data;},
        async: false
      });
    }

    if(actionable_options.properties.action_sound){
      this.action_sound = this.map.audio_manager.load_sfx(actionable_options.properties.action_sound);
    }
  }
  this.properties = actionable_options.properties || {};
}

Actionable.prototype.react = function(actor){
  if((!this.action && !this.enter_action) || this.is_busy){return;}

  if(this.action_sound){
    this.map.audio_manager.play(this.action_sound);
  }

  var _this = this;
  this.is_interacting = actor.is_interacting = true;
  this._eval_script(this.action || this.enter_action, function(){
    _this.is_interacting = actor.is_interacting = false;
  });
};

Actionable.prototype._eval_script = function(script, next){
  var me = this,
      player = this.map.player,
      dialog = this.map.dialog,
      load_map = this.map.engine.load_map,
      uses_dialog = script.indexOf("dialog.") !== -1,
      uses_next = script.indexOf("next()") !== -1,
      _next = function(){
        me.is_busy = false;
        next();
      };

  if(this.is_busy){
    return next();
  }

  this.is_busy = true;
  //if uses dialog listen to dialog_done and then call next when it is triggered
  //if uses next then pass in next
  //if not either of those call next right away
  eval("(function eval_csf(me, player, dialog, load_map, next){" + script + "})(me, player, dialog, load_map, _next);");

  if(uses_dialog){
    $(document).one("dialog_done", function(){
      return next();
    });

    $(document).one("dialog_finished", function(){
      me.is_busy = false;
    });
  }else if(!uses_dialog && !uses_next){
    this.is_busy = false;
    return next();
  }

};
