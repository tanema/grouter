package main

import (
	"net/http"
  "log"
  "github.com/googollee/go-socket.io"
  "github.com/tanema/grouter/json_map"
  "github.com/gorilla/mux"
)

func main() {
  sock_config := &socketio.Config{}
  sock_config.HeartbeatTimeout = 2
  sock_config.ClosingTimeout = 4

  sio := socketio.NewSocketIOServer(sock_config)

  sio.On("connect", func(ns *socketio.NameSpace){
    log.Println("Connected")
  })
  sio.Of("/ws").On("disconnect", func(ns *socketio.NameSpace){
    log.Println("DisConnected")
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

  r := mux.NewRouter()
  r.PathPrefix("/socket.io").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    sio.ServeHTTP(w, r)
  })
  r.PathPrefix("/").Handler(http.FileServer(http.Dir("./public/")))
  http.Handle("/", r)

	println("listening on port 3000")
  log.Fatal(http.ListenAndServe(":3000", nil))
}
