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

const fs = require("fs");
const path = require("path");

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
        // txtフォルダのファイルのリストを作成する
        this.txt = [];
        fs.readdir(this.dir + "/txt", (err, files) => {
            files.forEach(file => {
                if(file.toLowerCase().endsWith(".txt")) {
                    Model.inst.txt.push(file);
                }
            });
        });
        this.txt.sort();

        // bgフォルダのファイルのリストを作成する
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

        // chフォルダのファイルのリストを作成する
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

        // bgmフォルダのファイルのリストを作成する
        this.bgm = [];
        fs.readdir(this.dir + "/bgm", (err, files) => {
            files.forEach(file => {
                if(file.toLowerCase().endsWith(".ogg")) {
                    Model.inst.bgm.push(file);
                }
            });
        });
        this.bgm.sort();

        // seフォルダのファイルのリストを作成する
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

//
// ゲームの一覧を取得する
//
ipcMain.handle('listGames', (event) => {
    // ユーザのドキュメントフォルダにSuika2フォルダがない場合
    var path = app.getPath("documents") + "/Suika2";
    if(!fs.existsSync(path)) {
        return [];
    }

    // ゲームフォルダの一覧を返す
    var ret = [];
    fs.readdirSync(path).forEach(function(file) {
        ret.push(file);
    });
    return ret;
})

//
// ゲームを作成する
//
ipcMain.handle('createGame', (event, dir) => {
    // ゲームフォルダを作成する
    var path = app.getPath("documents") + "/Suika2/" + dir;
    if(!fs.mkdirSync(path, { recursive: true })) {
        return false;
    }

    // テンプレートをコピーする
    copyTemplateFiles("template", path, true);
    return true;
})

function copyTemplateFiles(src, dst, top) {
    console.log("going to copy");
    console.log(app.getAppPath() + "/" + src);
    if(!fs.existsSync(app.getAppPath() + "/" + src)) {
        return;
    }
    console.log("found template");
    if(top) {
        fs.readdirSync(app.getAppPath() + "/" + src).forEach(function (fname) {
            console.log("copy!");
            copyTemplateFiles(src + "/" + fname, dst + "/" + fname, false);
        });
        return;
    }
    if(fs.statSync(app.getAppPath() + "/" + src).isFile()) {
        let file = dst;
        let dir = path.dirname(file);
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(file, fs.readFileSync(app.getAppPath() + "/" + src));
    } else if (fs.statSync(app.getAppPath() + "/" + src).isDirectory()) {
        fs.readdirSync(app.getAppPath() + "/" + src).forEach(function (fname) {
            copyTemplateFiles(src + "/" + fname, dst + "/" + fname, false);
        });
    }
}

//
// ゲームを開く
//
ipcMain.handle('openGame', (event, dir) => {
    var path = app.getPath("documents") + "/Suika2/" + dir;
    Model.createInstance(path);
    return Model.inst !== null;
})

//
// ゲームフォルダのURLを取得する
//
ipcMain.handle('getBaseUrl', (event) => {
    return "file:///" + Model.inst.dir + "/";
})

//
// txtフォルダのファイルのリストを取得する
//
ipcMain.handle('getTxtList', (event) => {
    return Model.inst.txt;
})

//
// bgフォルダのファイルのリストを取得する
//
ipcMain.handle('getBgList', (event) => {
    return Model.inst.bg;
})

//
// chフォルダのファイルのリストを取得する
//
ipcMain.handle('getChList', (event) => {
    return Model.inst.ch;
})

//
// bgmフォルダのファイルのリストを取得する
//
ipcMain.handle('getBgmList', (event) => {
    return Model.inst.bgm;
})

//
// seフォルダのファイルのリストを取得する
//
ipcMain.handle('getSeList', (event) => {
    return Model.inst.se;
})
