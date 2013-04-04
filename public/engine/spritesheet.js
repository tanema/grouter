function SpriteSheet(tile_width, tile_height){
  this.tile_width = tile_width;
  this.tile_height = tile_height;
  this.image_sources = [];
  this.image_properties = [];
  this.tile_properties = {};
  this._frames = [];
  this._animated_tiles = [];
}

SpriteSheet.prototype.add_image = function(img_options, next){
  var _this = this,
      img = new Image();
      img_options = img_options || {},
      image_properties = img_options.properties || {};
  img_options.margin = img_options.margin || 0;
  img_options.spacing = img_options.spacing || 0;

  this.image_properties.push(image_properties);
  img.src = image_properties.src || img_options.image;
  console.log("Loading image " + img.src + " ...");
  img.onload = function () {
    _this.image_sources.push(img);
    _this._calculateFrames(img_options);
    if(next){next();}
  };

  //there will be no conflicts because it offsets the tileset numbers
  $.extend(this.tile_properties, img_options.tileproperties);
};

SpriteSheet.prototype.get = function(idx){
  return this._frames[idx - 1];
};

SpriteSheet.prototype._calculateFrames = function(img_options) {
  if(!this.loaded()){return;}
  var _this = this,
      tile_width = this.tile_width,
      tile_height = this.tile_height;
  for (var i=0; i<this.image_sources.length; i++) {
    var img = this.image_sources[i],
        cols = (img.width+1)/tile_width|0,
        rows = (img.height+1)/tile_height|0;

    for(var row=0; row < rows; row++){
      for(var col=0; col < cols; col++){
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            tile_properties = _this.tile_properties[_this._frames.length] || {},
            x = (col*tile_width) + (img_options.margin + (col*img_options.spacing)),
            y = (row*tile_height) + (img_options.margin + (row*img_options.spacing));

        canvas.setAttribute('width', _this.tile_width);
        canvas.setAttribute('height', _this.tile_height);
        ctx.drawImage(img, x, y, tile_width, tile_height, 0, 0, tile_width, tile_height);

        if(tile_properties.animated === "true"){
          var animated_tile = new AnimatedTile(canvas, tile_properties, _this)
          _this._frames.push(animated_tile);
          _this._animated_tiles.push(animated_tile);
        }else{
          _this._frames.push(new Tile(canvas, tile_properties, _this));
        }
      }
    }
  }
};

SpriteSheet.prototype.update = function(deltatime){
  for(var i = 0; i < this._animated_tiles.length; i++){
    this._animated_tiles[i].update(deltatime);
  }
};

SpriteSheet.prototype.loaded = function(){
  return this.image_properties.length == this.image_sources.length;
};