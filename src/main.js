'use strict';

const {app, BrowserWindow} = require("electron");

let mainWindow;

function createWindow (){
    mainWindow = new BrowserWindow({width: 1280, height: 720, webPreferences: {
        nodeIntegration: false,
	    contextIsolation: false,
	    preload: __dirname + '/preload.js'
    }});
    mainWindow.loadURL('file://' + __dirname + '/index.html');
}

app.on('ready', function() {
    createWindow();

//  mainWindow.webContents.openDevTools()
});

app.on('window-all-closed', () => {
    app.quit()
});
