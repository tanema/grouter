var Playable = require('./playable.js');

function Npc(npc_options, map, next){
  npc_options = npc_options || {};

  var properties = npc_options.properties || {},
      _this = this;

  this.idletime = properties.idletime || 3000;
  if(properties.onidle){
    this.onidle = properties.onidle;
    this._set_timer();
  }else if(properties.onidle_src){
    this.onidle_src = properties.onidle_src;
  }

  Playable.call(this, npc_options, map, next);
}

Npc.prototype = new Playable();

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

module.exports = Npc;