var app = require('app')
var BrowserWindow = require('browser-window')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // We're a single pane app for the moment, so we'll just close
  // instead of conditional closure on process.platform !== 'darwin'
  app.quit()
})

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.loadURL('file://' + __dirname + '/index.html')

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null
  })
})
