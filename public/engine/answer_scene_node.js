function AnswerSceneNode(data){
  SceneNode.call(this, data);
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
