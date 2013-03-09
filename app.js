
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
    SessionSockets = require('session.socket.io');

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
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var sessionSockets = new SessionSockets(io.listen(server), store, express.cookieParser(sessionSecret));

sessionSockets.on('connection', function (err, socket, session) {
  socket.emit('session', session);

  socket.on('foo', function(value) {
    session.foo = value;
    session.save();
    socket.emit('session', session);
  });
});