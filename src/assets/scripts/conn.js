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
      //console.log('still pending',id);
      clearTimeout(timeout);
      setTimeout(function() {
        timer(id, interval, msg, force);
      }, 10);
      return;
    }
    pending[id] = true;
    globalConn.sendData(msg);
    //console.log('sent msg',id);
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

function getWebsocketPort(ip) {
  //const PORT  = '32323';
  const PORT = self.location.port === '4200' ? '1207' : self.location.port;
  return new Promise((resolve,reject)=>{
    const http = new XMLHttpRequest();
    const url = 'http://' + ip + ':' + PORT + '/cs/api/ports';
    const timeout = setTimeout(()=>{
      reject();
    },2000);
    http.open('get',url);
    http.send();
    http.onreadystatechange=(e)=>{
      if (http.readyState === 4 && http.status === 200) {
        clearTimeout(timeout);
        try {
          resolve(JSON.parse(http.response).ws);
        } catch (err) {
          reject();
        }
      }
    };
  });
}

function MCConnection() {
  var conn = this;

  // Private Variables
  var ws = null;
  var MCPORT = 3010;  
  var IP = self.location.hostname;
  //var IP = '10.4.20.86';
  var reset = true;
  var isConnected = false;
  var pingPongInterval = null;
  var lastPong = 0;
  var PING_INTERVAL = 500;
  
  this.pingPong = function() {
    clearInterval(this.pingPongInterval);
    this.pingPongInterval = setInterval(function(){
      if (ws && ws.readyState !== ws.OPEN) {
        clearInterval(this.pingPongInterval);
        return;
      } else if (ws) {
        ws.send('X');
        var now = new Date().getTime();
        if (lastPong === 0) return;
        var diff = now - lastPong;
        if (diff > 1000) {
          lastPong = 0;
          worker.postMessage({ serverMsg: true, msg: 2, clean: false, code: 1000 }); // ONCLOSE MESSAGE
          console.log('PONG DIFF TOO LONG',diff);
          isConnected = false;
          clearInterval(this.pingPongInterval);
          ws.close();
          return;
        }
      }
    },PING_INTERVAL);
  };

  this.connect = async function() {
    //Initiate a websocket connection
    const port = await getWebsocketPort(IP) || MCPORT;
    try {
      ws = new WebSocket('ws://' + IP + ':' + port);
      ws.onopen = function() {
        console.log('WEBSOCKET OPENED');
        ws.send('X');
        setTimeout(() => {
          worker.postMessage({ serverMsg: true, msg: 0 }); // ONOPEN MESSAGE
        }, 100);
        reset = false;
        isConnected = true;
        //conn.pingPong();
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
        lastPong = 0;
        clearInterval(this.pingPongInterval);
      };
      ws.onmessage = function(msg) {
        if (msg.data === 'O') {
          lastPong = new Date().getTime();
          return;
        }
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
      console.log(err ? err.message : 'Websocket could not connect to port ' + port);
    }
  };

  this.sendData = function(jsonData) {
    if (ws && ws.readyState === ws.OPEN) {
      try {
        ws.send(jsonData);
        //if (jsonData.indexOf('cyc0') !== -1) console.log('cyc0');
      } catch (err) {
        console.log(err);
        console.log('MC Connection terminated unexpectedly, trying to reconnect...');
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
