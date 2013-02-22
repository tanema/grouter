function AudioManager(){
  this.sounds = {};
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