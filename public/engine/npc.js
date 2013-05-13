function Npc(npc_options, map, layer, next){
  npc_options = npc_options || {};

  var properties = npc_options.properties || {},
      _this = this;

  this.id = npc_options.id || Date.now();
  Displayable.call(this, npc_options, map, layer, next);
  this.type = "npc"; //this is just for spawning players so I don't have to set it everytime
}

Npc.prototype = new Displayable();
