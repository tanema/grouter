package main

import (
	"net/http"
  "log"
  "github.com/tanema/go-socket.io"
  "github.com/tanema/grouter/json_map"
)

var players map[string]*json_map.Player

func main() {
  sio := socketio.NewSocketIOServer(&socketio.Config{})
  sio.On("connect", func(ns *socketio.NameSpace){
    log.Println("Connected: ", ns.Id())
  })
  sio.On("disconnect", func(ns *socketio.NameSpace){
    log.Println("Disconnected: ", ns.Id())
  })
  sio.On("player move", func(ns *socketio.NameSpace, from_x, from_y, to_x, to_y int){
    log.Println("player move")
  })
  sio.On("join map", func(ns *socketio.NameSpace, map_name, layer_name, player_name string){
    log.Println("join map")
    log.Println(map_name)
  })
  sio.On("set name", func(ns *socketio.NameSpace, name string){
    log.Println("set name")
  })

  json_map.NewMap("public/maps/map0.json")

  sio.Handle("/", http.FileServer(http.Dir("./public/")))

	println("listening on port 3000")
  log.Fatal(http.ListenAndServe(":3000", sio))
}
