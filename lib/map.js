var Layer = require('./layer.js'),
    _ = require("underscore");

function Map(engine, map_name, map_data){
  this.engine = engine;
  this.map_name = map_name;
  this.layers = {};
  this.player_prototype= null;
  this.players = null;
  this.npcs = {};
  this.actionable = {};

  this.data = map_data;
  this.properties = map_data.properties || {};
  this.orientation = map_data.orientation;

  this.tiles = {};
  for(var i = 0; i < map_data.tilesets.length; i++){
    _.extend(this.tiles, map_data.tilesets[i].tileproperties);
  }
  this._load_layers(map_data.layers);
}

Map.prototype.set_socket_connector = function(socket){
  this.socket = socket;
}

Map.prototype._load_layers = function(layers){
  for (var i = layers.length - 1; i >= 0; i--) {
    var layer = new Layer(layers[i], this);
    this.layers[layer.name] = layer;
  };
};

Map.prototype.at = function(x,y){
  var results = {tiles: [], objects: []},
      layer_name;
  for(layer_name in this.layers){
    var layer = this.layers[layer_name];
    if(layer.is_tilelayer()){
      var tile = this.tiles[(layer.data[(x + y * layer.width)]) - 1];
      if(tile){
        results.tiles.push(tile);
      }
    }else if(layer.is_objectgroup()){
      var object_name, object;
      for(object_name in layer.objects){
        object = layer.objects[object_name];
        if(object && object.x === x && object.y === y){
          results.objects.push(object);
        }
      }
    }
  }
  return results;
};

module.exports = Map;
