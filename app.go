package main

import (
  "fmt"
  "log"
	"net/http"
  "./json_map"
  "./socketio"
)

var maps = []string{"map0", "map1"}
const port = 3001

func main() {
  sio := socketio.NewSocketIOServer(&socketio.Config{})
  sio.Handle("/", http.FileServer(http.Dir("./public/")))

  for _, map_name := range maps {
    new_map := json_map.NewMap("public/maps/"+map_name+".json", sio)
    go new_map.Run()
  }

	log.Println("Listening on port ", port)
  log.Fatal(http.ListenAndServe(fmt.Sprint(":", port), sio))
}
