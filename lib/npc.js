var Playable = require('./playable.js'),
    fs = require("fs"),
    path = require("path");

function Npc(npc_options, map){
  npc_options = npc_options || {};

  var properties = npc_options.properties || {},
      _this = this;

  this.idletime = properties.idletime || 3000;
  if(properties.onidle){
    this.onidle = properties.onidle;
    this._set_timer();
  }else if(properties.onidle_src){
    this.onidle_src = path.join(map.engine.public_dir, properties.onidle_src);
    this.onidle = fs.readFileSync(this.onidle_src, 'utf8');
  }

  Playable.call(this, npc_options, map);
}

Npc.prototype = new Playable();

Npc.prototype.idle_action = function(){
  var _this = this;
  console.log("moving");
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
