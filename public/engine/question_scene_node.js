function QuestionSceneNode(actor, data){
  SceneNode.call(this, actor, data);
  this.nodes = []
  for(var i = 0; i < data.child_nodes.length; i++){
    this.nodes.push(new AnswerSceneNode(actor, data.child_nodes[i]));
  }
}

QuestionSceneNode.prototype = new SceneNode();
