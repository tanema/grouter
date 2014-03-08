function Screen(canvas, tilewidth, tileheight){
  this.canvas = canvas;
  this.tilewidth = tilewidth;
  this.tileheight = tileheight;
}

Screen.prototype.update = function(){
  this.maintain_aspect_ratio()
  this.width  = this.canvas.width;
  this.height = this.canvas.height;
  this.tilesX = this.canvas.width  / this.tilewidth;
  this.tilesY = this.canvas.height / this.tileheight;
}

//keep the width constant and change the height to reflect changes to the screen
Screen.prototype.maintain_aspect_ratio = function(){
  var ratio = document.documentElement.clientWidth/document.documentElement.clientHeight;
  this.canvas.height = this.canvas.width/ratio; 
}
