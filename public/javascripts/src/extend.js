Function.prototype.extend = function(parent) {
  var child = this;
  child.prototype = parent;
  child.prototype.$super = parent;
  child.prototype = new child(Array.prototype.slice.call(arguments,1));
  child.prototype.constructor = child;
};