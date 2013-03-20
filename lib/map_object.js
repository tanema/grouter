function MapObject(options, map){
  options = options || {};
  this.map = map || {};
  this.name = options.name;
  this.type = options.type;
  this.x = options.x || 0;
  this.y = options.y || 0;

  if(map){
    //convert x and y to tile co-ords because tiled gives objects in absolute co-ords
    this.x = this.x / map.data.tilewidth;
    this.y = this.y / map.data.tileheight;
  }

  if(options.properties){
    this.properties = options.properties;
    this.initalize_properties();
  }
}

MapObject.prototype.initalize_properties = function(next){
  this.map_tile_width = this.map.data.tilewidth;
  this.map_tile_height = this.map.data.tileheight;
  this.tilewidth = parseInt(this.properties.width,10)|| this.map_tile_width;
  this.tileheight = parseInt(this.properties.height, 10) || this.map_tile_height;
  this.offset_x = this.tilewidth - this.map_tile_width;
  this.offset_y = this.tileheight - this.map_tile_height;

  if(this.properties.action){
    this.action = this.properties.action;
  }else if(this.properties.action_src){
    this.action = this.properties.action_src;
  }

  if(this.type == "npc"){
    if(this.properties.onidle){
      this.onidle = this.properties.onidle;
    }else if(this.properties.onidle_src){
      this.onidle = this.properties.onidle_src;
    }

    this.movement = {};
    var movements = ["left", "down", "up", "right", "idle"];
    for(var i = 0; i < movements.length; i++){
      if(this.properties[movements[i]] && (startend = this.properties[movements[i]].split(','))){
        this.movement[movements[i]] = [];
        var id;
        while((id = startend.shift())){
          this.movement[movements[i]].push(parseInt(id, 10));
        }
      }
    }

    this.speed = this.properties.speed || 200;
    this.animation_speed = this.speed / this.movement["left"].length;
    this.animation_step_size = 1 / this.movement["left"].length;
  }
};

module.exports = MapObject;