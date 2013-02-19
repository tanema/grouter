function Npc(npc_options, map, next){
  Displayable.call(this, npc_options, map, next);
}

Npc.prototype = new Displayable();