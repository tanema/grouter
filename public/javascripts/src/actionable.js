function Actionable(actionable_options, map){
  actionable_options = actionable_options || {};
  this.name = actionable_options.name;
  this.x = actionable_options.x || 0;
  this.y = actionable_options.y || 0;

  if(map){
    //convert x and y to tile co-ords because tiled gives objects in absolute co-ords
    this.x = this.x / map.spritesheet.tile_width;
    this.y = this.y / map.spritesheet.tile_height;
  }
  this.action = actionable_options.action;
}

Actionable.prototype.action = function(){

};