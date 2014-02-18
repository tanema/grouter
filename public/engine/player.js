function Player(player_options, map, layer, next){
  player_options = player_options || {};
  this.id = player_options.id = map.engine.getSocketId();
  player_options.type = "player";
  Displayable.call(this, player_options, map, layer, next);
  this.bind_key_events();
}

Player.prototype = new Displayable();
Player.prototype.is_player = true

Player.prototype.bind_key_events = function(){
  var _this = this;
  document.addEventListener("keypress_up",   function(e){_this.user_move(e)});
  document.addEventListener("keypress_down", function(e){_this.user_move(e)});
  document.addEventListener("keypress_left", function(e){_this.user_move(e)});
  document.addEventListener("keypress_right",function(e){_this.user_move(e)});
  document.addEventListener("keypress_z",    function(e){_this.user_interact(e)});
};

Player.prototype.user_move = function(e){
  var direction = e.type.replace("keypress_", "");
  if(!this.is_moving){
    var to_tile = this._get_to_tile(direction);
    if(this.move(direction) && this.socket){
      this.socket.emit("move", to_tile.x, to_tile.y);
    }
  }
}

Player.prototype.user_interact = function(){
  if(this.map.dialog.is_talking){
    this.map.dialog.next();
  }else if(!this.is_busy){
    this.take_action();
  }
}

Player.prototype.take_action = function(){
  var to_tile = this._get_to_tile();

  for(var i=0; i < to_tile.objects.length; i++){
    to_tile.objects[i].react(this);
  }
};

Player.prototype.teleport = function(x, y, skip_notify){
  //call Superto_x, to_y
  this.x = x;
  this.y = y;
  if(!skip_notify){
    this.socket.emit("player teleport", x, y);
  }
};
