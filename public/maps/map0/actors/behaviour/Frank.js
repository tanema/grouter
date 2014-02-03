function animate(){
  console.log("test")
  var directions = ["up", "down", "left", "right"],
      direction = directions[Math.floor(Math.random() * (3 - 0 + 1)) + 0],
      distance = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
  move(direction, distance);
}
