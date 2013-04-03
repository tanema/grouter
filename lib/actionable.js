function Actionable(actionable_options, map){
  actionable_options = actionable_options || {};
  this.map = map || {};
  this.name = actionable_options.name;
  this.type = actionable_options.type;
  this.x = actionable_options.x || 0;
  this.y = actionable_options.y || 0;

  if(actionable_options.properties){
    if(actionable_options.properties.action){
      this.action = actionable_options.properties.action;
    }else if(actionable_options.properties.action_src){
      this.action_src = actionable_options.properties.action_src;
    }

  }
}

Actionable.prototype.react = function(actor){
  if(!this.action || this.is_busy){return;}

  var _this = this;
  this.is_interacting = actor.is_interacting = true;
  this._eval_script(this.action, function(){
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

module.exports = Actionable;