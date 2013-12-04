package main

import (
	"net/http"
  "log"
  "github.com/tanema/go-socket.io"
  "github.com/tanema/grouter/json_map"
)

var players map[string]*json_map.Player
var maps map[string]*json_map.Map

func main() {
  sio := socketio.NewSocketIOServer(&socketio.Config{})
  sio.On("connect", func(ns *socketio.NameSpace){
    log.Println("Connected: ", ns.Id())
  })
  sio.On("disconnect", func(ns *socketio.NameSpace){
    log.Println("Disconnected: ", ns.Id())
    sio.Broadcast("kill player", ns.Id());
    player_name := ns.Session.Values["name"].(string)
    delete(players, player_name)
  })
  sio.On("player move", func(ns *socketio.NameSpace, from_x, from_y, to_x, to_y int){
    log.Println("player move")
    ns.Session.Values["x"] = to_x
    ns.Session.Values["y"] = to_y
    sio.Except(ns).Broadcast("actor move", ns.Id(), from_x, from_y, to_x, to_y);
  })
  sio.On("join map", func(ns *socketio.NameSpace, map_name, player_name string){
    log.Println("join map")
    ns.Session.Values["map"] = map_name
    ns.Session.Values["name"] = player_name

    new_player := maps[map_name].Player.ShallowClone()
    new_player.Id = ns.Id()
    new_player.Name = player_name

    players[new_player.Id] = new_player

    //set the players initial data
    //ns.Emit("player connected", connected_data);
    //tell everyone else about this player
    sio.Except(ns).Broadcast("spawn player", new_player);
  })
  sio.On("set name", func(ns *socketio.NameSpace, name string){
    println("set name")
    ns.Session.Values["name"] = name
    sio.Broadcast("change name", ns.Id(), name)
  })

  players = map[string]*json_map.Player{}
  maps = map[string]*json_map.Map{
    "map0.json": json_map.NewMap("public/maps/map0.json"),
  }

  sio.Handle("/", http.FileServer(http.Dir("./public/")))

	println("listening on port 3000")
  log.Fatal(http.ListenAndServe(":3000", sio))
}
