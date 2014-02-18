function Dialog(){
  this.dialog_height = 25;
  this.font_size = 12;
  this.line_height = 8;
  this.padding_left = 10;
  this.padding_right = 10;
  this.padding_bottom = 5;

  this.is_talking = false;
  this.script = [];
  this.dialog_open_length = 1000;
  this.can_close = false;
}

Dialog.prototype.draw = function(ctx){
  //nothing to see here
  if(!this.is_talking){return;}

  // first give text a background
  ctx.fillStyle = '#dedede';
  ctx.fillRect(0, (ctx.canvas.height - this.dialog_height), ctx.canvas.width, this.dialog_height);
  // then draw text
  ctx.font = this.font_size + 'px pokemon';
  ctx.fillStyle = 'black';
  this.drawText(ctx, this.script[0], this.padding_left, (ctx.canvas.height - this.padding_bottom));
};

Dialog.prototype.drawText = function(ctx, text, x, y) {
  var words = text.split(' '),
      line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ',
        metrics = ctx.measureText(testLine),
        testWidth = metrics.width;
    if (testWidth > (ctx.canvas.width - this.padding_left - this.padding_right) && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += this.line_height;
    }
    else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

Dialog.prototype.say = function(script){
  if(this.just_closed){return;}

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
    $(document).trigger("dialog_done");
    this.is_talking = false;
    var _this = this;
    this.just_closed = true;
    setTimeout(function(){
      _this.just_closed = false;
      $(document).trigger("dialog_finished");
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
