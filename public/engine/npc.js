function Npc(npc_options, map, layer, next){
  npc_options = npc_options || {};

  var properties = npc_options.properties || {},
      _this = this;

  this.id = npc_options.id || Date.now();

  this.idletime = properties.idletime || 3000;
  if(properties.onidle){
    this.onidle = properties.onidle;
    this._set_timer();
  }else if(properties.onidle_src){
    console.log(" → loading npc's behaviour " + properties.onidle_src);
    $.ajax({
      url: properties.onidle_src,
      dataType: 'text', // have to set as text otherwise get ref errors from me/dialog/ect
      success: function(data){
        _this.onidle = data;
        _this._set_timer();
      },
      async: false
    });
  }

  Displayable.call(this, npc_options, map, layer, next);
}

Npc.prototype = new Displayable();

Npc.prototype.idle_action = function(){
  var _this = this;

  if(this.onidle){
    this._eval_script(this.onidle, function(){
      _this._set_timer();
    });
  }
};

Npc.prototype._set_timer = function(){
  var _this = this;

  setTimeout(function(){
    _this.idle_action();
  }, this.idletime);
};