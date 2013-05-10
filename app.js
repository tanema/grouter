var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    sessionSecret = "secret",
    cookieParser = express.cookieParser(sessionSecret),
    RedisStore = require("connect-redis")(express),
    sessionStore = new RedisStore(),
    Engine = require('./lib/engine.js'),
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
 * Routes
 */

app.get('*', routes.index);

var server = http.createServer(app),
    io = require('socket.io').listen(server);

Engine.public_dir = path.resolve(__dirname, "public");
// load the maps
Engine.load_maps();
// start the engine
Engine.listen(io, sessionStore, cookieParser);

//Start The server
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
