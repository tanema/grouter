package main

import (
	"net/http"
  "log"
  "github.com/tanema/go-socket.io"
  "grouter/json_map"
)

var maps map[string]*json_map.Map

func main() {
  sio := socketio.NewSocketIOServer(&socketio.Config{})
  sio.On("connect", func(ns *socketio.NameSpace){
    log.Println("Connected: ", ns.Id())
  })
  sio.On("disconnect", func(ns *socketio.NameSpace){
    log.Println("Disconnected: ", ns.Id())
    if ns.Session.Values["map"] == nil {
      return
    }
    map_name := ns.Session.Values["map"].(string)
    if player_map := maps[map_name]; player_map != nil {
      player := player_map.Players[ns.Id()]
      ns.Session.Values["x"] = player.X
      ns.Session.Values["y"] = player.Y
      ns.Session.Values["layer"] = player.LayerName
      ns.Session.Values["name"] = player.Name
      sio.In(map_name).Broadcast("kill player", ns.Id());
      delete(player_map.Players, ns.Id())
    }
  })

  maps = map[string]*json_map.Map{
    "map0.json": json_map.NewMap("public/maps/map0.json", sio),
  }

  sio.Handle("/", http.FileServer(http.Dir("./public/")))

	println("listening on port 3000")
  log.Fatal(http.ListenAndServe(":3000", sio))
}
