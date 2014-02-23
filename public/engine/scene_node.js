function SceneNode(actor, data){
  this.actor = actor || {}
  this.font_size = 20;
  this.line_height = this.font_size + (this.font_size/4);
  this.on_air = false;
  this.scroll_top = 0;
  this.can_close = false;
  
  data = data || {}
  this.type = data.type;
  this.text = data.text;
  switch(data.speaker){
    case 'player':
      this.speaker = "You: ";
      break;
    case 'character':
      this.speaker = this.actor.name + ": ";
      break;
    case 'narrator':
    default:
      this.speaker = "";
  }
  this.action = data.action;
  this.target = data.target;
  this.x = data.x;
  this.y = data.y
}

SceneNode.prototype.run = function(player, cb){
  this.done = cb;
  this.on_air = true;
  this.lock_close();
}

SceneNode.prototype.draw = function(ctx){
  if(!this.on_air){return;}

  this.top = (ctx.canvas.height/2 + 10);
  this.left = 10;
  this.width = ctx.canvas.width - 20;
  this.height = (ctx.canvas.height/2 - 20);
  this.bottom = this.top + this.height;
  this.right = this.left + this.width;
  this.padding = 20;

  // first give text a background
  ctx.fillStyle = '#dedede';
  ctx.fillRect(this.left, this.top, this.width, this.height);
  // then draw text
  ctx.font = this.font_size + 'px pokemon';
  ctx.fillStyle = 'black';
  this.drawText(ctx, this.speaker + this.text, this.left + this.padding, (this.top + this.padding + 10) - this.scroll_top);
};

SceneNode.prototype.drawText = function(ctx, text, x, y) {
  var words = text.split(' '),
      line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ',
        testWidth = ctx.measureText(testLine).width;
    if (testWidth > (this.width - this.padding) && n > 0) {
      if((y - this.line_height) > this.top){
        ctx.fillText(line, x, y);
      }
      line = words[n] + ' ';
      y += this.line_height;
      if(y > this.bottom){
        break;
      }
    }
    else {
      line = testLine;
    }
  }

  if(((y - this.line_height) > this.top) && (y + this.line_height < this.bottom)){
    ctx.fillText(line, x, y);
  }
}

SceneNode.prototype.user_arrow = function(direction){
  switch(direction){
    case 'up':
      if(this.scroll_top > 0){
        this.scroll_top-=10;
      }
      break;
    case 'down':
      this.scroll_top+=10;
      break;
  }
}

SceneNode.prototype.user_action = function(){
  if(!this.can_close){return;}
  this.done()
  this.on_air = false;
}

SceneNode.prototype.lock_close = function(){
  this.can_close = false;
  var _this = this;
  setTimeout(function(){
    _this.can_close = true;
  }, 1000);
};
