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
