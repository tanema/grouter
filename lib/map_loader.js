var fs = require('fs'),
    path = require('path'),
    Map = require("./map.js");

module.exports = function(engine, maps_path){
  var files = fs.readdirSync(maps_path)
    , maps = {};

  for(var i =0; i < files.length; i++){
    if(files[i].indexOf('.json') !== -1){
      var file_path = path.resolve(maps_path, files[i])
        , file_name = file_path.substr(file_path.lastIndexOf('/')+1)
        , data = fs.readFileSync(file_path, 'utf8');
      maps[file_name] = new Map(engine, file_name, JSON.parse(data));
    }
  }

  return maps;
}
