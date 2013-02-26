function AudioManager(type){
  this.type = type || "sfx";
  this.volume = 1;
  this.step_size = 0.05;
  this.sounds = {};
  this._bind_change_events();
  this._volume_changed();
}

AudioManager.prototype.load_src = function(src){
  var sound = new Audio(src),
      filename = sound.src.substring(sound.src.lastIndexOf('/')+1);
  filename = filename.substring(0, filename.lastIndexOf('.'));

  this.sounds[filename] = sound;

  return filename;
};

AudioManager.prototype.play = function(sound_name){
  this.sounds[sound_name].play();
};

AudioManager.prototype.stop = function(sound_name){
  this.sounds[sound_name].pause();
  this.currentTime = 0;
};

AudioManager.prototype.pause = function(sound_name){
  this.sounds[sound_name].pause();
};

AudioManager.prototype.loop = function(sound_name){
  var sound = this.sounds[sound_name];
  if (typeof sound.loop === 'boolean'){
    sound.loop = true;
  }else{
    sound.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
  }
  sound.play();
};

AudioManager.prototype._volume_changed = function(){
  for(var sound_name in this.sounds){
    this.sounds[sound_name].volume = this.volume;
  }
};

AudioManager.prototype._bind_change_events = function(){
  var _this = this;

  function change_volume(vol){
    _this.volume = vol;
    _this._volume_changed();
  }

  $(document).on(this.type+"_off", function(){
    change_volume(0);
  }).on(this.type+"_on", function(){
    if(_this.volume === 0){
      change_volume(1);
    }
  }).on(this.type+"_vol_down", function(){
    change_volume(_this.volume - _this.step_size);
  }).on(this.type+"_vol_up", function(){
    change_volume(_this.volume + _this.step_size);
  }).on(this.type+"_vol_change", function(e, vol){
    change_volume(vol/100);
  });

};