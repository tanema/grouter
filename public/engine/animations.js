function Animation(){}

Animation.ease_in = function(initial, changes, duration){
  this._animate(initial, changes, duration, function (t, b, c, d) {
    t /= d;
    return c*t*t*t*t + b;
  })
}

Animation.ease_out = function(initial, changes, duration){
  this._animate(initial, changes, duration, function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t*t*t*t - 1) + b;
  });
}

Animation.ease = function(initial, changes, duration){
  this._animate(initial, changes, duration, function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t*t + b;
    t -= 2;
    return -c/2 * (t*t*t*t - 2) + b;
  });
}

Animation.linear = function(initial, changes, duration){
  this._animate(initial, changes, duration, function (t, b, c, d) {
	  return c*t/d + b;
  })
}

Animation._animate = function(initial, changes, duration, animation_function){
  var change_keys = Object.keys(changes),
      interval = 13,
      starting_values = JSON.parse(JSON.stringify(initial))
      time_passed = 0;
  duration = duration || 2000;

  function do_animations(){
    time_passed += interval;
    for(var i = 0; i < change_keys.length; i++){
      initial[change_keys[i]] = animation_function(time_passed, starting_values[change_keys[i]], (changes[change_keys[i]] - starting_values[change_keys[i]]), duration)
    }
    if(time_passed >= duration || initial[change_keys[i]] != changes[change_keys[i]]){
      clearInterval(timerId)
    }
  }
  var timerId = setInterval(do_animations, interval)
}
