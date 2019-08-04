var globalConn = new MCConnection();
var worker = this;
var intervals = [];
var pending = [];

onmessage = function(e) {
  if (e.data.serverMsg) {
    switch (e.data.msg) {
      case 0: // CONNECT REQUEST
        globalConn.connect();
        break;
      case 1: // RESET REQUEST
        globalConn.reset();
        break;
      case 2: // STOP INTERVAL
        if (e.data.id) intervals[e.data.id] = null;
        break;
    }
    return;
  }
  if (e.data.interval) {
    // INTERVAL
    intervals[e.data.id] = true;
    timer(e.data.id, e.data.interval, e.data.msg, e.data.force);
  } else globalConn.sendData(e.data.msg);
};

function timer(id, interval, msg, force) {
  var now = new Date().getTime();
  var timeout;
  if (intervals[id]) {
    timeout = setTimeout(function() {
      timer(id, interval, msg, force);
    }, interval);
    if (!globalConn.connected()) return;
    if (!force && pending[id]) {
      //vcconsole.log('still pending',id);
      clearTimeout(timeout);
      setTimeout(function() {
        timer(id, interval, msg, force);
      }, 10);
      return;
    }
    globalConn.sendData(msg);
    //console.log('sent msg',id);
    pending[id] = true;
    if (new Date().getTime() - now > interval) {
      clearTimeout(timeout);
      setTimeout(function() {
        timer(id, interval, msg, force);
      }, interval);
    }
  } else {
    clearTimeout(timeout);
  }
}

function MCConnection() {
  var conn = this;

  // Private Variables
  var ws = null;
  var MCPORT = 3010;
  var IP = self.location.hostname;
  //var IP = '10.4.20.51';
  var reset = true;
  var isConnected = false;

  this.connect = function() {
    //Initiate a websocket connection
    try {
      ws = new WebSocket('ws://' + IP + ':' + MCPORT);
      ws.onopen = function() {
        setTimeout(() => {
          worker.postMessage({ serverMsg: true, msg: 0 }); // ONOPEN MESSAGE
        }, 100);
        console.log('WEBSOCKET OPENED');
        reset = false;
        isConnected = true;
      };
      ws.onerror = function(e) {
        worker.postMessage({ serverMsg: true, msg: 1 }); // ONERROR MESSAGE
        console.log('WEBSOCKET ERROR: ');
        console.log(e);
      };
      ws.onclose = function(event) {
        worker.postMessage({ serverMsg: true, msg: 2, clean: event.wasClean, code: event.code }); // ONCLOSE MESSAGE
        console.log('WEBSOCKET CLOSED',event);
        isConnected = false;
      };
      ws.onmessage = function(msg) {
        try {
          let jsonMessage = JSON.parse(msg.data);
          var id = jsonMessage['cmd_id'];
          if (id >= 0 && pending[id]) {
            //console.log('done pending',msg);
            pending[id] = false;
          }
          worker.postMessage({ serverMsg: false, msg: jsonMessage });
        } catch (err) {
          console.log('INVALID JSON FROM MC WEB SERVER', err);
          console.log('json string:' + msg.data);
        }
      };
      setTimeout(function() {
        if (ws && ws.readyState !== ws.OPEN) {
          ws.close();
          worker.postMessage({ serverMsg: true, msg: 3 }); // TIMEOUT MESSAGE
        }
      }, 5000);
    } catch (err) {
      console.log(err.message);
    }
  };

  this.sendData = function(jsonData) {
    if (ws && ws.readyState === ws.OPEN) {
      try {
        ws.send(jsonData);
        //console.log(jsonData);
      } catch (err) {
        console.log(err);
        alert('MC Connection terminated unexpectedly, trying to reconnect...');
        conn.connect();
      }
    }
  };

  this.reset = function() {
    if (reset) return;
    console.log('RESET CONNECTION');
    for (var interval in intervals) {
      intervals[interval] = false;
      intervalCounter = 0;
    }
    if (ws !== null) ws.close();
    ws = null;
    reset = true;
  };

  this.connected = function() {
    return isConnected;
  };
}
