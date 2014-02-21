function QuestionSceneNode(data){
  SceneNode.call(this, data);
  this.nodes = []
  for(var i = 0; i < data.child_nodes.length; i++){
    this.nodes.push(new AnswerSceneNode(data.child_nodes[i]));
  }
}

QuestionSceneNode.prototype = new SceneNode();
