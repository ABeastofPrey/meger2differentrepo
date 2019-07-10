onmessage = function(e) {
  var nodes = e.data.nodes;
  var search = e.data.search.toUpperCase();
  var data = nodes.slice();
  for (var i = 0; i < data.length; i++) {
    data[i] = findInNode(search, data[i]);
  }
  data = data.filter(node => {
    return node !== null;
  });
  postMessage(data);
};

function iterationCopy(src) {
  var target = {};
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }
  return target;
}

function findInNode(s, n) {
  // copy node to not change original
  var node = this.iterationCopy(n);

  if (s.length === 0) return node;

  var i = node.name.lastIndexOf('.');
  var ext = i > -1 ? node.name.substring(i + 1).toUpperCase() : '';
  var nameOnly = i > -1 ? node.name.substring(0, i) : node.name;
  var nameMatch =
    (ext.length > 0 &&
      s.startsWith('*.') &&
      ext === s.substring(2).toUpperCase()) ||
    (s.indexOf('.') === -1 &&
      nameOnly.toUpperCase().includes(s.toUpperCase())) ||
    node.name.toUpperCase().includes(s.toUpperCase());
  if (node.isFolder) {
    var filteredChildren = [];
    var found = false;
    for (var child of node.children) {
      var newChild = this.findInNode(s, child);
      if (newChild !== null) {
        filteredChildren.push(newChild);
        found = true;
      }
    }
    node.children = filteredChildren;
    return found ? node : null;
  } else if (nameMatch) return node;
  return null;
}
