function Keyboard(){
  var _this = this;

  window.addEventListener('keydown', function (event) {
    _this.keydown = event;
  }, false);
  window.addEventListener('keyup', function (event) {
    _this.keydown = false;
  }, false);

  setInterval(function(){
    if (!!_this.keydown) {
      _this.delegate_key();
    }
  }, 10);
}

Keyboard.prototype.delegate_key = function () {
  if(Keyboard.key_def[this.keydown.keyCode]){
    Grouter.fire_event("keypress_" + Keyboard.key_def[this.keydown.keyCode])
  }
};

/// KEYBOARD CONSTANTS ///
Keyboard.key_def = [];
Keyboard.key_def[37] = "left";
Keyboard.key_def[38] = "up";
Keyboard.key_def[39] = "right";
Keyboard.key_def[40] = "down";
Keyboard.key_def[90] = "z";
Keyboard.key_def[88] = "x";
Keyboard.key_def[87] = "w";
Keyboard.key_def[83] = "s";
Keyboard.key_def[65] = "a";
Keyboard.key_def[68] = "d";
Keyboard.key_def[16] = "shift";
Keyboard.key_def[13] = "return";
