var Frank = new BehaviorTree({
  title: "Frank",
  tree: new BehaviorTree.Sequence({
    nodes: [
      new BehaviorTree.Task({
        title: 'walk',
        run: function() {
          var directions = ["up", "down", "left", "right"],
              direction = directions[Math.floor(Math.random() * (3 - 0 + 1)) + 0],
              distance = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
          var l = look("left", 1);
          for(var i=0; i < l.length; i++){
            var pos = l[i]
            for(var j=0; j < pos.Tiles.length; j++){
              var tile = pos.Tiles[j]
              console.log(tile.Solid)
            }
            for(var j=0; j < pos.Objects.length; j++){
              var obj = pos.Objects[j]
              console.log("obj" +obj)
            }
          }
          move(direction, distance);
          this.success()
        }
      }),
      new BehaviorTree.Task({
        title: 'lookaround',
        run: function() {
          setTimeout(this, this.success, 3000)
        }
      }),
    ]
  })
});
