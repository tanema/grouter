var _ = require("underscore");

module.exports = function(maps, io, sessionStore, cookieParser){

  var SessionSockets = require('session.socket.io'),
      sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

  sessionSockets.on('connection', function (err, socket, session) {

    socket.on('join map', function(map_name, layer, name, properties){
      session.map = map_name;
      session.layer = layer;
      session.name = name;
      session.save();

      var map = maps[map_name],
          player = _.clone(map.player_prototype),//quick clone hack
          npc_name, npc,
          npcs = map.npcs

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

      //join here to avoid sending own self to self
      socket.join(map_name);

      //spawn all the npcs from the map
      for(npc_name in npcs){
        npc = _.clone(npcs[npc_name]);
        npc.map = null; // getting rid of circular ref
        socket.emit('spawn npc', npc); // only need to update where the npcs are
      }
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

  return sessionSockets
}