function CameraSceneNode(actor, data){
  SceneNode.call(this, actor, data);
}

CameraSceneNode.prototype = new SceneNode();
CameraSceneNode.prototype.draw = function(ctx){}
