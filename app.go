package main

import (
  "fmt"
  "log"
	"net/http"
  "grouter/json_map"
  "github.com/tanema/go-socket.io"
)

var (
  maps = []string{"map0"}
  port = 3001
)

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

	log.Println("listening on port ", port)
  log.Fatal(http.ListenAndServe(fmt.Sprint(":", port), sio))
}
