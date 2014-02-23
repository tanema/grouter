function Scene(actor, nodes){
  this.nodes = []
  for(var i = 0; i < nodes.length; i++){
    var node = nodes[i];
    switch(node.type){
      case 'dialogue': node = new DialogueSceneNode(actor, node); break;
      case 'question': node = new QuestionSceneNode(actor, node); break; 
      case 'event': node = new EventSceneNode(actor, node); break; 
      case 'camera': node = new CameraSceneNode(actor, node); break; 
    }
    this.nodes.push(node);
  }
}

Scene.prototype.start = function(player, cb){
  var _this = this,
      index = -1;
  var next = function(){
    index++
    if(_this.nodes[index]){
      _this.current_node = _this.nodes[index]
      _this.current_node.run(player, next)
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
