function QuestionSceneNode(map, actor_name, data){
  SceneNode.call(this, map, actor_name, data);
  data = data || {};
  this.nodes = []
  for(var i = 0; i < data.child_nodes.length; i++){
    this.nodes.push(new AnswerSceneNode(map, actor_name, data.child_nodes[i]));
  }
}

QuestionSceneNode.prototype = new SceneNode();

QuestionSceneNode.prototype.prefix = function(){
  return this.actor.name + " : ";
}
