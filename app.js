
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    sessionSecret = "secret",
    cookieParser = express.cookieParser(sessionSecret),
    RedisStore = require("connect-redis")(express),
    store = new RedisStore(),
    SessionSockets = require('session.socket.io'),
    fs = require('fs'),
    Map = require("./lib/map.js"),
    maps = {},
    app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.cookieSession({store: store}));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 * Load up maps
 */
var files = fs.readdirSync(path.resolve(__dirname, 'public/maps'));
for(var i =0; i < files.length; i++){
  var file_path = path.resolve(__dirname, 'public/maps', files[i]);
  if(file_path.indexOf('.json') !== -1){
    file_name = file_path.substr(file_path.lastIndexOf('/')+1);
    fs.readFile(file_path, 'utf8', function (err, data) {
      if (err) {
        console.log(err);
        return;
      }
      maps[file_name] = new Map(JSON.parse(data));
    })
  }
}

app.get('*', routes.index);

var server = http.createServer(app),
    io = require('socket.io').listen(server),
    sio = new SessionSockets(io, store, cookieParser);

sio.on('connection', function (err, socket, session) {

  socket.on('join map', function(map_name, layer, name, properties){
    set_data(map_name, layer, name, function(){
      var player = maps[map_name].player_prototype;

      player.id = socket.id
      player.type = "npc";
      player.layer_name = layer;

      socket.broadcast.to(map_name).emit('spawn player', player);
      socket.join(map_name);

      var sockets = io.sockets.in(map_name).sockets,
          npc_name, socket_id,
          npcs = maps[map_name].npcs;

      //spawn other characters
      for(socket_id in sockets){
        var data = sockets[socket_id].store.data;

        player.id = socket_id
        player.layer_name = layer;

        socket.emit('spawn player', player);
      }
      //spawn all the npcs from the map
      for(npc_name in npcs){
        console.log(npc_name)
        //socket.emit('spawn player', npcs[npc_name]);
      }
    })
  });

  socket.on('player move', function(direction, distance){
    //socket.broadcast.to(socket.data.map).emit('npc move', socket.id, socket.data.layer, direction, distance);
  });

  socket.on('set name', function(name){
    socket.set('name', name, function(){
      socket.broadcast.to(socket.data.map).emit('change name', socket.id, name);
    });
  });

  function set_data(map, layer, name, cb){
    socket.set('map', map, function(){
      socket.set('layer', layer, function(){
        socket.set('name', name, function(){
          cb();
        });
      });
    });
  }

  socket.on('disconnect', function () {
    io.sockets.emit('kill player', socket.id);
  });

});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});