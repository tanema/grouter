function CameraSceneNode(map, actor_name, data){
  SceneNode.call(this, map, actor_name, data);

  data = data || {};
  this.action = data.action;
  this.target = data.target;
  this.x = data.x;
  this.y = data.y
}

CameraSceneNode.prototype = new SceneNode();
CameraSceneNode.prototype.draw = function(ctx){}

CameraSceneNode.prototype.run = function(cb){
  var target = this.get_target() 
  switch(this.action){
    case 'pan':
      this.map.camera.pan_to(target.x, target.y, cb)
      break;
    case 'jump':
      this.map.camera.set(target.x, target.y)
      cb()
      break;
  }
}                          

CameraSceneNode.prototype.get_target = function(){
  switch(this.target){
    case 'player':
      return this.map.player
    case 'character':
      return this.actor()
    case 'position':
      return {x: this.x, y: this.y}
  }
}
