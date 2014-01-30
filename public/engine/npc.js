function Npc(npc_options, map, layer, next){
  npc_options = npc_options || {};
  this.id = npc_options.id || npc_options.name;
  npc_options.type = "npc";//this is just for spawning players so I don't have to set it everytime 
  Displayable.call(this, npc_options, map, layer, next);
  this.register_socket_events()
}

Npc.prototype = new Displayable();

Npc.prototype.register_socket_events = function(){
  var _this = this;
  this.socket.on('kill', function(){_this.kill()});
  this.socket.on('move', function(to_x, to_y){_this.move_to(to_x, to_y);});
  this.socket.on('teleport', function(to_x, to_y){_this.teleport(to_x, to_y);});
  this.socket.on('change layer', function(layer){_this.set_layer(this.map.layers[layer], true);});
};
