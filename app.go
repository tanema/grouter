package main

import (
	"net/http"
  "log"
  "github.com/tanema/go-socket.io"
  "grouter/json_map"
)

var maps = []string{"map0"}

func main() {
  sio := socketio.NewSocketIOServer(&socketio.Config{})
  sio.Handle("/", http.FileServer(http.Dir("./public/")))

  sio.On("connect", func(ns *socketio.NameSpace){
    log.Println("Connected: ", ns.Id())
  })
  sio.On("disconnect", func(ns *socketio.NameSpace){
    log.Println("Disconnected: ", ns.Id())
  })

  for _, map_name := range maps {
    new_map := json_map.NewMap("public/maps/"+map_name+".json", sio)
    go new_map.Run()
  }

	println("listening on port 3000")
  log.Fatal(http.ListenAndServe(":3000", sio))
}
