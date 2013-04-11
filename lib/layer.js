var Npc = require("./npc.js"),
    Playable = require("./playable.js"),
    Actionable = require("./actionable.js");

function Layer(layer_options, map){
  this.name = layer_options.name;
  this.type = layer_options.type;
  this.properties = layer_options.properties || {};

  this.opacity = layer_options.opacity;
  this.visible = layer_options.visible;

  this.data = layer_options.data;
  this.objects = {};

  this.x = layer_options.x;
  this.y = layer_options.y;
  this.width = layer_options.width;
  this.height = layer_options.height;

  this.map = map;

  if(this.is_objectgroup()){
    this._initiate_objects(layer_options.objects);
  }
}

Layer.prototype.is_tilelayer = function(){
  return this.type == "tilelayer";
};

Layer.prototype.is_objectgroup = function(){
  return this.type == "objectgroup";
};

Layer.prototype._initiate_objects = function(objects){
  var _this = this;
  for (var i = objects.length - 1; i >= 0; i--) {
    var object = objects[i];
    if(object.type.toLowerCase() == "player"){
      _this.map.player_prototype = object;
      var player = new Playable(object, _this.map);
    }else if(object.type.toLowerCase() == "npc"){
      var npc = new Npc(object, _this.map);
      _this.map.npcs[npc.name] = npc;
    }else if(object.type.toLowerCase() == "actionable"){
      var actionable = new Actionable(object, _this.map);
      _this.map.actionable[actionable.name] = actionable;
    }
  };
};


module.exports = Layer;