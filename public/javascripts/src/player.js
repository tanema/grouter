function Player(player_options, map, next){
  this.bind_key_events();
  Displayable.call(this, player_options, map, next);
}

Player.prototype = new Displayable();

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
    _this.activate();
  });
};

Player.prototype.activate = function(){
  var to_tile = this._get_to_tile();
  if(this.map.actionables[to_tile.x] && this.map.actionables[to_tile.x][to_tile.y]){
    this.map.actionables[this.to_x][this.to_y].action();
  }
};