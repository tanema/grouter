function Scene(nodes){
  this.nodes = []
  for(var i = 0; i < nodes.length; i++){
    this.nodes.push(new SceneNode(nodes[i]));
  }
}

Scene.prototype.start(primary_actor, secondary_actory, cb){
  var _this = this,
      index = -1;
  var next = function(){
    index++
    if(_this.nodes[index]){
      _this.current_node = _this.nodes[i]
      _this.current_node.run(primary_actor, secondary_actory, next)
    } else {
      _this.current_node = null;
      cb()
    }
  }
  next();
}
