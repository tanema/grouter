function GamepadSupport(){
  var gamepadSupportAvailable = navigator.getGamepads ||
      !!navigator.webkitGetGamepads ||
      !!navigator.webkitGamepads,
      _this = this;

  this.ticking = false;
  this.gamepads = [];
  this.prevRawGamepadTypes = [];
  if (!gamepadSupportAvailable) {
    console.log("Gamepad not supported")
  } else {
    if ('ongamepadconnected' in window) {
      window.addEventListener('gamepadconnected', function(e){_this.onGamepadConnect(e)});
      window.addEventListener('gamepaddisconnected', function(e){_this.onGamepadDisconnect(e)});
    } else {
      this.startPolling();
    }
  }
}

GamepadSupport.prototype.onGamepadConnect = function(event) {
  this.gamepads.push(event.gamepad);
  this.startPolling();
}
GamepadSupport.prototype.onGamepadDisconnect = function(event) {
  for (var i in this.gamepads) {
    if (this.gamepads[i].index == event.gamepad.index) {
      this.gamepads.splice(i, 1);
      break;
    }
  }
  if (this.gamepads.length == 0) {
    this.stopPolling();
  }
}

GamepadSupport.prototype.startPolling = function() {
  if (!this.ticking) {
    this.ticking = true;
    this.tick();
  }
}

GamepadSupport.prototype.stopPolling = function() {
  this.ticking = false;
}

GamepadSupport.prototype.tick = function() {
  this.pollStatus();
  var _this = this;
  requestAnimationFrame(function(){_this.tick()});
}

GamepadSupport.prototype.pollStatus = function() {
  this.pollGamepads();

  for (var i in this.gamepads) {
    var gamepad = this.gamepads[i];
    for(var button in GamepadSupport.BUTTONS){
      if(gamepad.buttons[GamepadSupport.BUTTONS[button]]){
        Grouter.fire_event("gamepad_" + button)
      }
    }
    for(var axes in GamepadSupport.AXES){
      if(gamepad.axes[GamepadSupport.AXES[axes]] 
          && (gamepad.axes[GamepadSupport.AXES[axes]] > GamepadSupport.AXES_THRESHHOLD ||
              gamepad.axes[GamepadSupport.AXES[axes]] < -GamepadSupport.AXES_THRESHHOLD)){
        Grouter.fire_event("gamepad_" + axes, {value: gamepad.axes[GamepadSupport.AXES[axes]]})
      }
    }
  }
},

GamepadSupport.prototype.pollGamepads = function() {
  var rawGamepads =
      (navigator.getGamepads && navigator.getGamepads()) ||
      (navigator.webkitGetGamepads && navigator.webkitGetGamepads());

  if (rawGamepads) {
    this.gamepads = [];
    for (var i = 0; i < rawGamepads.length; i++) {
      if (typeof rawGamepads[i] != this.prevRawGamepadTypes[i]) {
        this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
      }
      if (rawGamepads[i]) {
        this.gamepads.push(rawGamepads[i]);
      }
    }
  }
}

GamepadSupport.AXES_THRESHHOLD = 0.05;
GamepadSupport.BUTTONS = {
  a: 0, // face (main) buttons
  b: 1,
  x: 2,
  y: 3,
  left_shoulder: 4, // top shoulder buttons
  right_shoulder: 5,
  left_shoulder_bottom: 6, // bottom shoulder buttons
  right_shoulder_bottom: 7,
  select: 8,
  start: 9,
  left_analogue_stick: 10, // analogue sticks (if depressible)
  right_analogue_stick: 11,
  dpad_up: 12, // Directional (discrete) pad
  dpad_down: 13,
  dpad_left: 14,
  dpad_right: 15
}
GamepadSupport.AXES = {
  left_analogue_hor: 0,
  left_analogue_vert: 1,
  right_analogue_hor: 2,
  right_analogue_vert: 3
}
