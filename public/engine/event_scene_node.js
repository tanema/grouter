function EventSceneNode(map, actor_name, data){
  SceneNode.call(this, map, actor_name, data);
}

EventSceneNode.prototype = new SceneNode();
EventSceneNode.prototype.draw = function(ctx){}

EventSceneNode.prototype.run = function(cb){
  cb()
}
