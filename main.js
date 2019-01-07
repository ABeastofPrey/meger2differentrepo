/*
 * This is for ELECTRON
 */
const express = require('express');
const { app, BrowserWindow } = require('electron');
const Server = require('./server/server.js');
const fs = require('fs');
const mkdirp = require('mkdirp');
var win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000, 
    height: 700,
    backgroundColor: '#eee',
    icon: `file://${__dirname}/dist/assets/pics/logo_cs.ico`
  });
  win.setMenu(null);

  win.loadURL(`file://${__dirname}/dist/index.html`);
  
    const server = express();
    const router = express.Router();
    server.get('/omri', (req,res)=>{
      res.json({ message: 'hooray! welcome to our api!' });
    });
    router.get('/', (req,res)=>{
      res.json({ message: 'hooray! welcome to our api home!!!' });
    });
    server.use('/api', router);
    server.listen(1988,()=>{
      console.log('dir: ' + __dirname);
      console.log('server listening on 1988');
    });
    var conn = new Server.MCConnection('10.4.20.41',5003);
    /*mkdirp(__dirname + '/db/test',err=>{
      if (err)
        console.log('mkdir error',err);
      else {
        fs.writeFile(__dirname + '/db/test/test.db','testing',(err,data)=>{
          console.log(err ? err : 'DONE!');
        });
      }
    });*/

  //// uncomment below to open the DevTools.
   win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  });
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow();
  }
});

