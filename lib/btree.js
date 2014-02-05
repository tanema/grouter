var countUnnamed = 0;

function BehaviorTree(config){
  countUnnamed += 1;
  this.title = config.title || 'btree' + (countUnnamed);
  this._rootNode = config.tree;
  this._object = config.object;
};
BehaviorTree.prototype.setObject = function(obj){
  this._object = obj;
}
BehaviorTree.prototype.step = function(){
  if (this._started) {
    return
  }
  this._started = true;
  var node = BehaviorTree.getNode(this._rootNode);
  this._actualNode = node;
  node.setControl(this);
  node.start(this._object);
  node.run(this._object);
}
BehaviorTree.prototype.running = function(){
  this._started = false;
}
BehaviorTree.prototype.success = function(){
  this._actualNode.end(this._object);
  this._started = false;
}
BehaviorTree.prototype.fail = function(){
  this._actualNode.end(this._object);
  this._started = false;
}
BehaviorTree._registeredNodes = {};
BehaviorTree.register = function(name, node) {
  if (typeof name === 'string') {
    this._registeredNodes[name] = node;
  } else {
    // name is the node
    this._registeredNodes[name.title] = name;
  }
};
BehaviorTree.getNode = function(name) {
  var node = name instanceof Node ? name : this._registeredNodes[name];
  if (!node) {
    console.log('The node "' + name + '" could not be looked up. Maybe it was never registered?');
  }
  return node;
};

var Node = function(config){
  config = config || {}
  this.title = config.title;
  this.nodes = config.nodes;
  if(config.start){
    this.start = config.start
  }
  if(config.end){
    this.end = config.end
  }
  if(config.run){
    this.run = config.run
  }
}
Node.prototype.start = function(){}
Node.prototype.end = function(){}
Node.prototype.run = function(){
  console.log('Warning: run of ' + this.title + ' not implemented!'); this.fail();
}
Node.prototype.setControl = function(control){
  this._control = control;
}
Node.prototype.running = function(){
  this._control.running(this);
}
Node.prototype.success = function(){
  this._control.success();
}
Node.prototype.fail = function(){
  this._control.fail();
}

var BranchNode = function(config){
  config = config || {}
  Node.call(this, config);
  this.children = config.nodes || [];
}
BranchNode.prototype = new Node();
BranchNode.prototype.start = function(){
  this._actualTask = 0;
}
BranchNode.prototype.run = function(object){
  this._object = object;
  this.start();
  if (this._actualTask < this.children.length) {
    this._run();
  }
  this.end();
}
BranchNode.prototype._run = function(){
  var node = BehaviorTree.getNode(this.children[this._actualTask]);
  this._runningNode = node;
  node.setControl(this);
  node.start(this._object);
  node.run(this._object);
}
BranchNode.prototype.running = function(node){
  this._nodeRunning = node;
  this._control.running(node);
}
BranchNode.prototype.success = function(){
  this._nodeRunning = null;
  this._runningNode.end(this._object);
}
BranchNode.prototype.fail = function(){
  this._nodeRunning = null;
  this._runningNode.end(this._object);
}

var Priority = function(config){
  BranchNode.call(this, config);
}
Priority.prototype = new BranchNode();
Priority.prototype.success = function(){
  BranchNode.prototype.success.apply(this, arguments);
  this._control.success();
}
Priority.prototype.fail = function(){
  BranchNode.prototype.fail.apply(this, arguments);
  this._actualTask += 1;
  if (this._actualTask < this.children.length) {
    this._run(this._object);
  } else {
    this._control.fail();
  }
}

var Sequence = function(config){
  BranchNode.call(this, config);
}
Sequence.prototype = new BranchNode();
Sequence.prototype._run = function(){
  if (this._nodeRunning) {
    this._nodeRunning.run(this._object);
    this._nodeRunning = null;
  } else {
    BranchNode.prototype._run.apply(this, arguments);
  }
}
Sequence.prototype.success = function(){
  BranchNode.prototype.success.apply(this, arguments);
  this._actualTask += 1;
  if (this._actualTask < this.children.length) {
    this._run(this._object);
  } else {
    this._control.success();
  }
}
Sequence.prototype.fail = function(){
  BranchNode.prototype.fail.apply(this, arguments);
  this._control.fail();
}

var Random = function(config){
  BranchNode.call(this, config);
}
Random.prototype = new BranchNode();
Random.prototype.start = function(){
  BranchNode.prototype.start.apply(this, arguments);
  if (!this._nodeRunning) {
    this._actualTask = Math.floor(Math.random()*this.children.length);
  }
}
Random.prototype._run = function(){
  if (!this._runningNode) {
    BranchNode.prototype._run.apply(this, arguments);
  } else {
    this._runningNode.run(this._object);
  }
}
Random.prototype.success = function(){
  BranchNode.prototype.success.apply(this, arguments);
  this._control.success();
}
Random.prototype.fail = function(){
  BranchNode.prototype.fail.apply(this, arguments);
  this._control.fail();
}

var Decorator = function(config){
  Node.call(this, config);
  if (this.node) {
    this.node = BehaviorTree.getNode(this.node);
  }
}
Decorator.prototype = new Node();
Decorator.prototype.setNode = function(node){
  this.node = BehaviorTree.getNode(node);
}
Decorator.prototype.start = function(){
  this.node.setControl(this);
  this.node.start();
}
Decorator.prototype.end = function(){
  this.node.end();
}
Decorator.prototype.run = function(blackboard){
  this.node.run(blackboard);
}

var InvertDecorator = function(config){
  Decorator.call(this, config);
}
InvertDecorator.prototype = new Decorator();
InvertDecorator.prototype.success = function(){
  this._control.fail();
}
InvertDecorator.prototype.fail = function(){
  this._control.success();
}

var AlwaysSucceedDecorator = function(config){
  Decorator.call(this, config);
}
AlwaysSucceedDecorator.prototype = new Decorator();
AlwaysSucceedDecorator.prototype.success = function(){
  this._control.success();
}
AlwaysSucceedDecorator.prototype.fail = function(){
  this._control.success();
}

var AlwaysFailDecorator = function(config){
  Decorator.call(this, config);
}
AlwaysFailDecorator.prototype = new Decorator();
AlwaysFailDecorator.prototype.success = function(){
  this._control.fail();
}
AlwaysFailDecorator.prototype.fail = function(){
  this._control.fail();
}

BehaviorTree.BranchNode = BranchNode;
BehaviorTree.Priority = Priority;
BehaviorTree.Sequence = Sequence;
BehaviorTree.Random = Random;
BehaviorTree.Task = Node;
BehaviorTree.Decorator = Decorator;
BehaviorTree.InvertDecorator = InvertDecorator;
BehaviorTree.AlwaysSucceedDecorator = AlwaysSucceedDecorator;
BehaviorTree.AlwaysFailDecorator = AlwaysFailDecorator;
