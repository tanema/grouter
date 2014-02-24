function AnswerSceneNode(map, actor_name, data){
  SceneNode.call(this, map, actor_name, data);
  this.nodes = []
  for(var i = 0; i < data.child_nodes.length; i++){
    var node = data.child_nodes[i];
    switch(node.type){
      case 'dialogue': node = new DialogueSceneNode(node); break;
      case 'question': node = new QuestionSceneNode(node); break; 
      case 'event': node = new EventSceneNode(node); break; 
      case 'camera': node = new CameraSceneNode(node); break; 
    }
    this.nodes.push(node);
  }
}

AnswerSceneNode.prototype = new SceneNode();

AnswerSceneNode.prototype.run = function(cb){
  console.log("running")
  var _this = this,
      index = -1;
  var next = function(){
    index++
    if(_this.nodes[index]){
      _this.current_node = _this.nodes[index]
      _this.current_node.run(next)
    } else {
      _this.current_node = null;
      cb()
    }
  }
  next();
}