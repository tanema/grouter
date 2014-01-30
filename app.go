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
  })

  maps = map[string]*json_map.Map{
    "map0.json": json_map.NewMap("public/maps/map0.json", sio),
  }

  sio.Handle("/", http.FileServer(http.Dir("./public/")))

	println("listening on port 3000")
  log.Fatal(http.ListenAndServe(":3000", sio))
}
