'use strict';

const {app, BrowserWindow, ipcMain} = require("electron");

let mainWindow;

function createWindow (){
    mainWindow = new BrowserWindow({width: 1280, height: 720, webPreferences: {
        nodeIntegration: false,
	    contextIsolation: true,
	    preload: __dirname + '/preload.js'
    }});
    mainWindow.loadURL('file://' + __dirname + '/html/boot.html');
}

app.on('ready', function() {
    createWindow();

    // デバッグウィンドウ
    mainWindow.webContents.openDevTools()
});

app.on('window-all-closed', () => {
    app.quit()
});

//
// [モデル]
//

const fs = require('fs');

class Model {
    static inst;
    dir;
    txt;
    bg;
    ch;
    bgm;
    se;
    static createInstance(dir) {
        if(!fs.existsSync(dir + "/txt/init.txt")) {
            return null;
        }

        Model.inst = new Model();
        Model.inst.dir = dir;

        Model.inst.refreshFileList();
    }

    refreshFileList() {
        this.txt = [];
        fs.readdir(this.dir + "/txt", (err, files) => {
            files.forEach(file => {
                if(file.toLowerCase().endsWith(".txt")) {
                    Model.inst.txt.push(file);
                }
            });
        });
        this.txt.sort();

        this.bg = [];
        fs.readdir(this.dir + "/bg", (err, files) => {
            files.forEach(file => {
                var fn = file.toLowerCase();
                if(fn.endsWith(".png") || fn.endsWith(".jpg") || fn.endsWith(".jpeg")) {
                    Model.inst.bg.push(file);
                }
            });
        });
        this.bg.sort();

        this.ch = [];
        fs.readdir(this.dir + "/ch", (err, files) => {
            files.forEach(file => {
                var fn = file.toLowerCase();
                if(fn.endsWith(".png") || fn.endsWith(".jpg") || fn.endsWith(".jpeg")) {
                    Model.inst.ch.push(file);
                }
            });
        });
        this.ch.sort();

        this.bgm = [];
        fs.readdir(this.dir + "/bgm", (err, files) => {
            files.forEach(file => {
                if(file.toLowerCase().endsWith(".ogg")) {
                    Model.inst.bgm.push(file);
                }
            });
        });
        this.bgm.sort();

        this.se = [];
        fs.readdir(this.dir + "/se", (err, files) => {
            files.forEach(file => {
                if(file.toLowerCase().endsWith(".ogg")) {
                    Model.inst.se.push(file);
                }
            });
        });
        this.se.sort();
    }
}

ipcMain.handle('openModel', (event, data) => {
    var dir = data;
    Model.createInstance(dir);
    return Model.inst !== null;
})

ipcMain.handle('getBaseUrl', (event) => {
    return "file:///" + Model.inst.dir + "/";
})

ipcMain.handle('getTxtList', (event) => {
    return Model.inst.txt;
})

ipcMain.handle('getBgList', (event) => {
    return Model.inst.bg;
})

ipcMain.handle('getChList', (event) => {
    return Model.inst.ch;
})

ipcMain.handle('getBgmList', (event) => {
    return Model.inst.bgm;
})

ipcMain.handle('getSeList', (event) => {
    return Model.inst.se;
})
