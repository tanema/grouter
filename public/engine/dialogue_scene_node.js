function DialogueSceneNode(map, actor_name, data){
  SceneNode.call(this, map, actor_name, data);
  data = data || {};
  this.speaker = data.speaker;
}

DialogueSceneNode.prototype = new SceneNode();

DialogueSceneNode.prototype.prefix = function(){
  switch(this.speaker){
    case 'player':
      return "You : ";
    case 'character':
      return this.actor().name + " : ";
    case 'narrator':
    default:
      return "";
  }
}
