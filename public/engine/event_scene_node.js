function EventSceneNode(actor, data){
  SceneNode.call(this, actor, data);
}

EventSceneNode.prototype = new SceneNode();
EventSceneNode.prototype.draw = function(ctx){}
