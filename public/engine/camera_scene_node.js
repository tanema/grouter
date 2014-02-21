function CameraSceneNode(data){
  SceneNode.call(this, data);
}

CameraSceneNode.prototype = new SceneNode();
CameraSceneNode.prototype.draw = function(ctx){}
