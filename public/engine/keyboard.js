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
  if(key_def[this.keydown.keyCode]){
    Grouter.fire_event("keypress_" + key_def[this.keydown.keyCode])
  }
};

/// KEYBOARD CONSTANTS ///
var key_def = [];
key_def[37] = "left";
key_def[38] = "up";
key_def[39] = "right";
key_def[40] = "down";
key_def[90] = "z";
key_def[88] = "x";
key_def[87] = "w";
key_def[83] = "s";
key_def[65] = "a";
key_def[68] = "d";
key_def[16] = "shift";
key_def[13] = "return";
