function Player(player_options, map, layer, next){
  Displayable.call(this, player_options, map, layer, next);
  this.bind_key_events();
  this.register_socket_events();
}

Player.prototype = new Displayable();

Player.prototype.register_socket_events = function(){
  this.socket.emit("join map", this.map.name, this.layer.name);
};

Player.prototype.bind_key_events = function(){
  if(this.is_moving){return;}

  var _this = this;

  $(document).on("keypress_up", function(){
    _this.move("up");
  });
  $(document).on("keypress_down", function(){
    _this.move("down");
  });
  $(document).on("keypress_left", function(){
    _this.move("left");
  });
  $(document).on("keypress_right", function(){
    _this.move("right");
  });
  $(document).on("keypress_z", function(){
    if(_this.map.dialog.is_talking){
      _this.map.dialog.next();
    }else if(!_this.is_busy){
      _this.take_action();
    }
  });
};

Player.prototype.take_action = function(){
  var to_tile = this._get_to_tile();

  for(var i=0; i < to_tile.objects.length; i++){
    to_tile.objects[i].react(this);
  }
};