function Dialog(){
  this.font_size = 20;
  this.line_height = this.font_size + (this.font_size/4);
  this.is_talking = false;
  this.scroll_top = 0;
  this.script = [];
  this.dialog_open_length = 1000;
  this.can_close = false;
}

Dialog.prototype.draw = function(ctx){
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

Dialog.prototype.drawText = function(ctx, text, x, y) {
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

Dialog.prototype.user_arrow = function(e){
  var direction = e.type.replace("keypress_", "");
  this[direction]()
}

Dialog.prototype.up = function(e){
  if(this.scroll_top > 0){
    this.scroll_top-=10;
  }
}

Dialog.prototype.down = function(e){
  this.scroll_top+=10;
}

Dialog.prototype.left = function(e){}
Dialog.prototype.right = function(e){}

Dialog.prototype.user_action = function(e){
  this.next()
}

Dialog.prototype.say = function(script){
  if(this.just_closed){return;}
  this.scroll_top = 0;

  if(typeof script === "object"){ //pass in an array of things to say
    this.script = script;
  }else if(typeof script === "string"){
    this.script = [script];
  }
  this.is_talking = true;
  this._after_new_dialog();
};

Dialog.prototype.next = function(){
  //wait until you can close, this prevents the fast button repeat
  if(!this.can_close){return;}

  if(this.script.length > 1){
    this.script.shift();
  }else{
    Grouter.fire_event("dialog_done");
    this.is_talking = false;
    var _this = this;
    this.just_closed = true;
    setTimeout(function(){
      _this.just_closed = false;
      Grouter.fire_event("dialog_finished");
    }, this.dialog_open_length);
  }

  this._after_new_dialog();
};

Dialog.prototype._after_new_dialog = function(){
  this.can_close = false;
  var _this = this;
  setTimeout(function(){
    _this.can_close = true;
  }, this.dialog_open_length);
};
