function SceneNode(data){
  this.font_size = 20;
  this.line_height = this.font_size + (this.font_size/4);
  this.is_talking = false;
  this.scroll_top = 0;
  this.can_close = false;
  
  this.type = data.type;
  this.text = data.text;
  this.speaker = data.speaker;
  this.action = data.action;
  this.target = data.target;
  this.x = data.x;
  this.y = data.y
}

SceneNode.prototype.run = function(primary_actor, secondary_actory, cb){
  cb()
}

SceneNode.prototype.draw = function(ctx){
  //nothing to see here
  if(!this.is_talking){return;}

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
  this.drawText(ctx, this.script[0], this.left + this.padding, (this.top + this.padding + 10) - this.scroll_top);
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
  this.is_talking()
  this.is_talking = null;
}

SceneNode.prototype.lock_close = function(){
  this.can_close = false;
  var _this = this;
  setTimeout(function(){
    _this.can_close = true;
  }, 1000);
};
