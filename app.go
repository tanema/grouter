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
    map_name := ns.Session.Values["map"].(string)
    player_map := maps[map_name]

    player := player_map.Players[ns.Id()]
    ns.Session.Values["x"] = player.X
    ns.Session.Values["y"] = player.Y
    ns.Session.Values["layer"] = player.LayerName
    ns.Session.Values["name"] = player.Name
    log.Println("Disconnected: ", ns.Id())
    sio.Broadcast("kill player", ns.Id());
    delete(player_map.Players, ns.Id())
  })
  sio.On("player move", func(ns *socketio.NameSpace, to_x, to_y int){
    //TODO validate move
    map_name := ns.Session.Values["map"].(string)
    player_map := maps[map_name]
    player := player_map.Players[ns.Id()]
    player.X = float32(to_x)
    player.Y = float32(to_y)
    sio.Except(ns).Broadcast("actor move", ns.Id(), to_x, to_y);
  })
  sio.On("player change layer", func(ns *socketio.NameSpace, layer string){
    map_name := ns.Session.Values["map"].(string)
    player_map := maps[map_name]
    player := player_map.Players[ns.Id()]
    player.LayerName = layer
    sio.Except(ns).Broadcast("actor change layer", ns.Id(), layer);
  })
  sio.On("player teleport", func(ns *socketio.NameSpace, to_x, to_y int){
    //TODO validate move
    map_name := ns.Session.Values["map"].(string)
    player_map := maps[map_name]
    player := player_map.Players[ns.Id()]
    player.X = float32(to_x)
    player.Y = float32(to_y)
    sio.Except(ns).Broadcast("actor teleport", ns.Id(), to_x, to_y);
  })
  sio.On("join map", func(ns *socketio.NameSpace, map_name, player_name string){
    log.Println("join map")
    player_map := maps[map_name]
    ns.Session.Values["map"] = map_name
    ns.Session.Values["name"] = player_name

    new_player := maps[map_name].Player.ShallowClone()
    new_player.Id = ns.Id()
    new_player.Name = player_name
    if ns.Session.Values["x"] != nil && ns.Session.Values["y"] != nil {
      new_player.X = ns.Session.Values["x"].(float32)
      new_player.Y = ns.Session.Values["y"].(float32)
    }
    if ns.Session.Values["layer"] != nil {
      new_player.LayerName = ns.Session.Values["layer"].(string)
    }

    connected_data := struct {
      Player    *json_map.Sprite            `json:"player"`
      Players   map[string]*json_map.Sprite `json:"players"`
      Npcs      map[string]*json_map.Sprite `json:"npcs"`
    }{
      new_player,
      player_map.Players,
      player_map.Npcs,
    }

    //set the players initial data
    ns.Emit("player connected", connected_data);
    //tell everyone else about this player
    player_map.Players[new_player.Id] = new_player
    sio.Except(ns).Broadcast("spawn player", new_player);
  })
  sio.On("set name", func(ns *socketio.NameSpace, name string){
    println("set name")
    ns.Session.Values["name"] = name
    sio.Broadcast("change name", ns.Id(), name)
  })

  maps = map[string]*json_map.Map{
    "map0.json": json_map.NewMap("public/maps/map0.json"),
  }

  sio.Handle("/", http.FileServer(http.Dir("./public/")))

	println("listening on port 3000")
  log.Fatal(http.ListenAndServe(":3000", sio))
}
