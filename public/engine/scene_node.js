function SceneNode(map, actor_name, data){
  this.map = map || {};
  this.actor_name = actor_name || {};
  this.font_size = 25;
  this.line_height = this.font_size + (this.font_size/8);
  this.on_air = false;
  this.scroll_top = 0;
  this.can_close = false;
  this.margin = 10;
  
  data = data || {}
  this.type = data.type;
  this.text = data.text;
}

SceneNode.prototype.actor = function(){
  return this.map.objects[this.actor_name]
}

SceneNode.prototype.prefix = function(){
  return ""
}

SceneNode.prototype.run = function(cb){
  this.done = cb;
  this.on_air = true;
  this.lock_close();
}

SceneNode.prototype.generate_dimentions = function(ctx){
  this.top = ((ctx.canvas.height/3)*2 - this.margin);
  this.left = this.margin;
  this.width = ctx.canvas.width - (this.margin * 2);
  this.height = (ctx.canvas.height/3);
  this.bottom = this.top + this.height;
  this.right = this.left + this.width;
  this.padding = 20;
}

SceneNode.prototype.draw_background = function(ctx){
  // first give text a background
  ctx.beginPath();
  ctx.rect(this.left, this.top, this.width, this.height);
  ctx.fillStyle = '#dedede';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#6f6f6f';
  ctx.stroke();
  
  ctx.font = this.font_size + 'px pokemon';
  ctx.fillStyle = 'black';
  // then draw text
  if(this.scroll_top > 0){
    ctx.fillText("▲", this.left + this.width - this.padding, this.top + this.padding);
  }
  if(this.text_bottom > this.bottom){
    ctx.fillText("▼", this.left + this.width - this.padding, this.bottom - 10);
  }
}

SceneNode.prototype.draw = function(ctx){
  if(!this.on_air){return;}

  this.generate_dimentions(ctx)
  this.draw_background(ctx)
  this.drawText(ctx, this.prefix() + this.text, this.left + this.padding, (this.top + this.padding + this.margin) - this.scroll_top);
};

SceneNode.prototype.drawText = function(ctx, text, x, y) {
  var breaks = text.split('\n'),
      words, line, testLine, testWidth;
  for(var i = 0; i < breaks.length; i++){
    line = '';
    words = breaks[i].split(' ');

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
      } else {
        line = testLine;
      }
    }

    this.text_bottom = y + this.line_height;
    if(((y - this.line_height) > this.top) && (y + this.line_height < this.bottom)){
      ctx.fillText(line, x, y);
    }
    y += this.line_height;
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
      if(this.text_bottom > this.bottom){
        this.scroll_top+=10;
      }
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
