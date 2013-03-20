
/**
 * Module dependencies.
 */

var io = require('socket.io'),
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
  app.set('port', process.env.PORT || 3000);
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

var files = fs.readdirSync(path.resolve(__dirname, 'public/maps'));
for(var i =0; i < files.length; i++){
  var file_path = path.resolve(__dirname, 'public/maps', files[i]);
  if(file_path.indexOf('.json') !== -1){
    fs.readFile(file_path, 'utf8', function (err, data) {
      if (err) {
        console.log(err);
        return;
      }

      var map = new Map(JSON.parse(data));

      console.dir(map);
    });
  }
}




app.get('*', routes.index);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var sio = new SessionSockets(io.listen(server), store, express.cookieParser(sessionSecret));

sio.on('connection', function (err, socket, session) {
  // socket.emit('session', session);
  // socket.set('nickname', name, function () {});
  // socket.get('nickname', function (err, name) {});
  // session.foo = value;
  // session.save();

  // socket.on('join room', function (room) {
  //   socket.set('room', room, function(){} );
  //   socket.join(room);
  // });

  // socket.on('join partner', function(room_id, partner_id){
  //   socket.set('partner', partner, function(){} );
  //   socket.join(partner);
  // });
});