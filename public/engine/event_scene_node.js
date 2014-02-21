function EventSceneNode(data){
  SceneNode.call(this, data);
}

EventSceneNode.prototype = new SceneNode();
EventSceneNode.prototype.draw = function(ctx){}
