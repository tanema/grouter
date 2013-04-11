function Player(player_options, map, layer, next){
  Displayable.call(this, player_options, map, layer, next);

  this.id = map.engine.socket.socket.sessionid
  this.bind_key_events();
}

Player.prototype = new Displayable();

Player.prototype.bind_key_events = function(){
  if(this.is_moving){return;}

  var _this = this;

  $(document).on("keypress_up keypress_down keypress_left keypress_right", function(event){
    var direction = event.type.replace("keypress_", "");
    _this.socket.emit("player move", direction, 1, _this.x, _this.y);
    _this.move(direction);
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