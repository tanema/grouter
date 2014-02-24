function AnswerSceneNode(map, actor_name, data){
  data = data || {};
  Scene.call(this, map, actor_name, data.child_nodes);
  this.text = data.text
}

AnswerSceneNode.prototype = new Scene();
