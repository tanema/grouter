function Scene(map, actor_name, nodes){
  this.nodes = []
  for(var i = 0; i < nodes.length; i++){
    var node = nodes[i];
    switch(node.type){
      case 'dialogue': node = new DialogueSceneNode(map, actor_name, node); break;
      case 'question': node = new QuestionSceneNode(map, actor_name, node); break; 
      case 'event':    node = new EventSceneNode(map, actor_name, node); break; 
      case 'camera':   node = new CameraSceneNode(map, actor_name, node); break; 
    }
    this.nodes.push(node);
  }
}

Scene.prototype.start = function(cb){
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
