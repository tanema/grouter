function Player(player_options, map, layer, next){
  player_options = player_options || {};
  this.id = player_options.id = map.engine.getSocketId();
  player_options.type = "player";
  Sprite.call(this, player_options, map, layer, next);
}

Player.prototype = new Sprite();
Player.prototype.is_player = true

Player.prototype.user_move = function(e){
  var direction = e.type.replace("keypress_", "").replace("gamepad_dpad_", "");
  if(!this.is_moving){
    var to_tile = this._get_to_tile(direction);
    if(this.move(direction) && this.socket){
      this.socket.emit("move", to_tile.x, to_tile.y);
    }
  }
}

Player.prototype.user_interact = function(){
  if(!this.is_busy){
    var to_tile = this._get_to_tile();
    for(var i=0; i < to_tile.sprites.length; i++){
      to_tile.sprites[i].react(this);
    }
    for(var i=0; i < to_tile.actors.length; i++){
      to_tile.actors[i].react(this);
    }
  }
}

Player.prototype.teleport = function(x, y, skip_notify){
  //call Superto_x, to_y
  this.x = x;
  this.y = y;
  if(!skip_notify){
    this.socket.emit("player teleport", x, y);
  }
};
