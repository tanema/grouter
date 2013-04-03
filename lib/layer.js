var Npc = require("./npc.js"),
    Actionable = require("./actionable.js");

function Layer(layer_options, map, next){
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
    this._initiate_objects(layer_options.objects, next);
  }else if(next){
    next(this);
  }
}

Layer.prototype.is_tilelayer = function(){
  return this.type == "tilelayer";
};

Layer.prototype.is_objectgroup = function(){
  return this.type == "objectgroup";
};

Layer.prototype._initiate_objects = function(objects, next){
  if(objects.length === 0){return next(this);}

  var _this = this,
      object = objects.shift();

  if(object.type.toLowerCase() == "npc"){
    var npc = new Npc(object, _this.map);
    _this.map.objects[Npc.name] = _this.objects[Npc.name] = Npc;
    _this._initiate_objects(objects, next);
  }else if(object.type.toLowerCase() == "actionable"){
    var actionable = new Actionable(object, _this.map);
    _this.map.objects[actionable.name] = _this.objects[actionable.name] = actionable;
    _this._initiate_objects(objects, next);
  }else{
    _this._initiate_objects(objects, next);
  }
};


module.exports = Layer;