const mUtils = require('./message-utils.js');

exports.MCConnection = function(ip, port) {

  // create socket to MC
  var s = require('net').Socket();
  s.on('data', function(d){
    var buff = Buffer.from(d);
    for (var b of buff) {
      mUtils.decodeMessage(b);
    }
  });
  s.connect(port,ip);
  s.on('connect',()=>{
    write("?ver");
  });
  s.on('error', function(e){
    // Can't establish connection
  });
  
  this.disconnect = function() {
    s.end(()=>{
      console.log('client disconnected on port ' + port);  
    });
  }
  
  function write(msg) {
    s.write(mUtils.makeMessage(msg));
  }
};