var Frank = new BehaviorTree({
  title: "Frank",
  tree: new BehaviorTree.Sequence({
    nodes: [
      new BehaviorTree.Random({
        title: 'walk',
        nodes: [
          new BehaviorTree.Task({
            title: 'left',
            run: function() {
              move("left", Math.floor(Math.random() * (3 - 1 + 1)) + 1);
              this.success()
            }
          }),
          new BehaviorTree.Task({
            title: 'up',
            run: function() {
              move("up", Math.floor(Math.random() * (3 - 1 + 1)) + 1);
              this.success()
            }
          }),
          new BehaviorTree.Task({
            title: 'right',
            run: function() {
              move("right", Math.floor(Math.random() * (3 - 1 + 1)) + 1);
              this.success()
            }
          }),
          new BehaviorTree.Task({
            title: 'down',
            run: function() {
              move("down", Math.floor(Math.random() * (3 - 1 + 1)) + 1);
              this.success()
            }
          }),
        ]
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
