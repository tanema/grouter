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
    if(_this.map.dialog.is_talking){
      _this.map.dialog.next();
    }else{
      _this.take_action();
    }
  });
};

Player.prototype.take_action = function(){
  if(this.is_acting){
    return;
  }

  var to_tile = this._get_to_tile();
  this.is_acting = true;

  for(var i=0; i < to_tile.objects.length; i++){
    if(to_tile.objects[i].react()){
      break; //if action succeeded then dont do any other action
    }
  }

  this.is_acting = false;
};