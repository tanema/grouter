function Animation(){}

Animation.ease_in = function(initial, changes, options){
  this._animate(initial, changes, options, function (t, b, c, d) {
    t /= d;
    return c*t*t*t*t + b;
  })
}

Animation.ease_out = function(initial, changes, options){
  this._animate(initial, changes, options, function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t*t*t*t - 1) + b;
  });
}

Animation.ease = function(initial, changes, options){
  this._animate(initial, changes, options, function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t*t + b;
    t -= 2;
    return -c/2 * (t*t*t*t - 2) + b;
  });
}

Animation.linear = function(initial, changes, options){
  this._animate(initial, changes, options, function (t, b, c, d) {
	  return c*t/d + b;
  })
}

Animation._animate = function(initial, changes, options, animation_function){
  var change_keys = Object.keys(changes),
      interval = 13,
      starting_values = JSON.parse(JSON.stringify(initial))
      time_passed = 0;

  options = options || {}
  var duration = options.duration || 800,
      callback = options.callback || function(){};

  function do_animations(){
    time_passed += interval;
    for(var i = 0; i < change_keys.length; i++){
      initial[change_keys[i]] = animation_function(time_passed, starting_values[change_keys[i]], (changes[change_keys[i]] - starting_values[change_keys[i]]), duration)
    }
    if(time_passed >= duration || initial[change_keys[i]] != changes[change_keys[i]]){
      clearInterval(timerId)
      callback();
    }
  }
  var timerId = setInterval(do_animations, interval)
}
