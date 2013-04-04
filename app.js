
/**
 * Module dependencies.
 */

var IO = require('socket.io'),
    express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    sessionSecret = "secret",
    RedisStore = require("connect-redis")(express),
    store = new RedisStore(),
    SessionSockets = require('session.socket.io'),
    fs = require('fs'),
    Map = require("./lib/map.js"),
    maps = {};

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.cookieSession({store: store,secret: sessionSecret, key: 'express.sid'}));
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

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = IO.listen(server),
    sio = new SessionSockets(io, store, express.cookieParser(sessionSecret));

sio.on('connection', function (err, socket, session) {
  // socket.emit('session', session);
  // socket.set('nickname', name, function () {});
  // socket.get('nickname', function (err, name) {});
  // session.foo = value;
  // session.save();
  // io.sockets.in('room').emit('event_name', data)

  // socket.on('join room', function (room) {
  //   socket.set('room', room, function(){} );
  //   socket.join(room);
  // });

  socket.on('join map', function(map_name, layer){
    socket.set('map', map_name, function(){} );
    //spawn npc's
    //spawn other player's avatars
    io.sockets.in(map_name).emit('player spawn', socket.id, socket.id, {}, layer);
    socket.join(map_name);
  });
});