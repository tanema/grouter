
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
    sessionStore = new RedisStore(),
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
  app.use(express.session({ store: sessionStore }));
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

/*
 * Routes
 */

app.get('*', routes.index);



var server = http.createServer(app),
    io = require('socket.io').listen(server);

var SessionSockets = require('session.socket.io'),
    sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

sessionSockets.on('connection', function (err, socket, session) {

  socket.on('join map', function(map_name, layer, name, properties){
    session.map = map_name;
    session.layer = layer;
    session.name = name;
    session.save();

    var map = maps[map_name],
        player = JSON.parse(JSON.stringify(map.player_prototype)), //quick clone hack
        npc_name,
        npcs = map.npcs

    console.log(player.x)

    player.id = socket.id
    player.layer_name = layer;
    player.x = session.x * map.data.tilewidth || player.x;
    player.y = session.y * map.data.tileheight || player.y;

    // set player back to where they were last time
    socket.emit("player connected", player.x / map.data.tilewidth, player.y / map.data.tileheight)
    // tell everyone else about this player
    socket.broadcast.to(map_name).emit('spawn player', player);

    //spawn other characters
    io.sockets.in(map_name).clients().forEach(function (player_socket) {
      sessionSockets.getSession(player_socket, function (err, player_session) {
        player = JSON.parse(JSON.stringify(map.player_prototype)), //quick clone hack
        player.id = player_socket.id;
        player.layer_name = layer;
        player.x = player_session.x ? map.data.tilewidth * player_session.x : player.x;
        player.y = player_session.y ? map.data.tileheight * player_session.y : player.y;
        socket.emit('spawn player', player);
      });
    });
    // player.id = socket_id;
    // player.layer_name = layer;
    // socket.emit('spawn player', player);

    //join here to avoid sending own self to self
    socket.join(map_name);

    //spawn all the npcs from the map
    //for(npc_name in npcs){
      // console.log(npc_name)
      // socket.emit('spawn npc', npcs[npc_name]);
    //}
  });

  socket.on('player move', function(direction, distance, x, y, to_x, to_y){
    socket.broadcast.to(session.map).emit('actor move', socket.id, direction, distance, x, y, to_x, to_y);
    session.x = to_x;
    session.y = to_y;
    session.save();
  });

  socket.on('set name', function(name){
    session.name = name;
    session.save();
    socket.broadcast.to(socket.data.map).emit('change name', socket.id, name);
  });

  socket.on('disconnect', function () {
    io.sockets.emit('kill player', socket.id);
  });

});

//Start The server
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
