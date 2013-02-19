function Screen(canvas, tilewidth, tileheight){
  this.width  = canvas.width;
  this.height = canvas.height;
  this.tilesX = canvas.width  / tilewidth;
  this.tilesY = canvas.height / tileheight;
}