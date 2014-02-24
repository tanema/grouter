function QuestionSceneNode(map, actor_name, data){
  SceneNode.call(this, map, actor_name, data);
  data = data || {};
  this.nodes = []
  for(var i = 0; i < data.child_nodes.length; i++){
    this.nodes.push(new AnswerSceneNode(map, actor_name, data.child_nodes[i]));
  }

  this.select_index = 0;
  this.selected_answer = null;
  this.is_answering = false;
}

QuestionSceneNode.prototype = new SceneNode();

QuestionSceneNode.prototype.prefix = function(){
  return this.actor().name + " : ";
}


QuestionSceneNode.prototype.draw = function(ctx){
  if(this.is_answering && this.on_air){
    var text = [];
    for(var i = 0; i < this.nodes.length; i++){
      text.push((i == this.select_index ? " ▶ " : "     ") + this.nodes[i].text)
    }
    this.draw_background(ctx)
    this.drawText(ctx, text.join("\n"), this.left + this.padding, (this.top + this.padding + this.margin) - this.scroll_top);
  } else {
    SceneNode.prototype.draw.call(this, ctx)
  }
}

QuestionSceneNode.prototype.user_arrow = function(direction){
  SceneNode.prototype.user_arrow.call(this, direction)
  if(this.is_answering){
    switch(direction){
      case 'up':
        if(this.select_index > 0){
          this.select_index--
        }
        break;
      case 'down':
        if(this.select_index < (this.nodes.length - 1)){
          this.select_index++
        }
        break;
    }
    this.selected_answer = this.nodes[this.select_index]
  }
}

QuestionSceneNode.prototype.user_action = function(){
  if(this.is_answering && this.can_close){
    this.on_air = false;
    this.selected_answer.run(this.done)
  } else if(this.can_close) {
    this.is_answering = true;
    this.lock_close();
  }
}
