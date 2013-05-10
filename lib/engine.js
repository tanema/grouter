var path = require('path');

module.exports = {
  maps: {},
  public_dir: "",
  load_maps: function(maps_path){
    this.maps = require('./map_loader.js')(this, path.resolve(this.public_dir, maps_path || "maps"));
  },
  listen: function(io, sessionStore, cookieParser){
    var socket_connector = require('./socket_connector.js')(this.maps, io, sessionStore, cookieParser),
        map_name, maps = this.maps;
    for(map_name in maps){
      maps[map_name].set_socket_connector(socket_connector);
    }
  }
}
