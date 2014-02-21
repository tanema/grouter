function SceneNode(data){
  this.type = data.type;
  this.text = data.text;
  this.speaker = data.speaker;
  this.action = data.action;
  this.target = data.target;
  this.x = data.x;
  this.y = data.y

  this.nodes = []
  for(var i = 0; i < data.child_nodes.length; i++){
    this.nodes.push(new SceneNode(data.child_nodes[i]));
  }
}

SceneNode.prototype.run = function(primary_actor, secondary_actory, cb){

}
