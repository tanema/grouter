function Scene(nodes){
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

Scene.prototype.draw = function(ctx){
  if(this.current_node){
    this.current_node.draw(ctx)
  }
}

Scene.prototype.user_arrow = function(direction){
  if(this.current_node){
    this.current_node.user_arrow(direction)
  }
}

Scene.prototype.user_action = function(){
  if(this.current_node){
    this.current_node.user_action()
  }
}
