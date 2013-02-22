function Npc(npc_options, map, next){
  npc_options = npc_options || {};

  var properties = npc_options.properties || {},
      _this = this;

  this.onidle = properties.onidle;
  this.idletime = properties.idletime || 3000;

  setTimeout(function(){
    _this.idle_action();
  }, this.idletime);

  Displayable.call(this, npc_options, map, next);
}

Npc.prototype = new Displayable();

Npc.prototype.idle_action = function(){
  if(this.onidle){
    this._eval_script(this.onidle);
  }

  var _this = this;
  setTimeout(function(){
    _this.idle_action();
  }, this.idletime);
};