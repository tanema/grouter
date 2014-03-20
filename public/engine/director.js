function Director(map, data){
  this.map = map || {};
  this.just_closed = false;
  this.characters = {}
  for(var name in data){
    var scenes = data[name];
    this.characters[name] = [];
    for(var i = 0; i < scenes.length; i++){
      this.characters[name].push(new Scene(map, name, scenes[i]));
    }
  }
}

Director.prototype.act = function(actor, cb){
  if(this.just_closed || !this.characters[actor.name]){return;}
  var _this = this;
  this.map.player.is_busy = actor.is_busy = true;
  this.current_scene = this.characters[actor.name][0];
  this.current_scene.start(function(){
    _this.current_scene = null;
    _this.map.player.is_busy = actor.is_busy = false;
    _this.lock_open();
    cb()
  })
}

Director.prototype.draw = function(ctx){
  if(this.current_scene){
    this.current_scene.draw(ctx)
  }
}

Director.prototype.user_arrow = function(e){
  if(this.current_scene){
    this.current_scene.user_arrow(e.type.replace("keypress_", "").replace("gamepad_dpad_", ""))
  }
}

Director.prototype.user_action = function(e){
  if(this.current_scene){
    this.current_scene.user_action()
  }
}

Director.prototype.lock_open = function(){
  var _this = this;
  this.just_closed = true;
  setTimeout(function(){
    _this.just_closed = false;
  }, 1000);
};
