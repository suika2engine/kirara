'use strict';

const {app, BrowserWindow, ipcMain} = require("electron");

let mainWindow;

function createWindow () {
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
// モデル操作
//

const fs = require("fs");
const path = require("path");

class Model {
    static dir = "";
    static txt = [];
    static bg = [];
    static ch = [];
    static bgm = [];
    static se = [];
    static mov = [];
    static scenarioFile = "";
    static scenarioData = [""];
}

//
// ゲームの一覧を取得する
//
ipcMain.handle('getGameList', (event) => {
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

    // 実行ファイルをコピーする
    if(process.platform === "win32") {
        fs.writeFileSync(path + "/suika.exe", fs.readFileSync(app.getAppPath() + "/apps/suika.exe"));
        fs.writeFileSync(path + "/suika-pro.exe", fs.readFileSync(app.getAppPath() + "/apps/suika-pro.exe"));
    } else if(process.platform === "darwin") {
        fs.writeFileSync(path + "/mac.zip", fs.readFileSync(app.getAppPath() + "/apps/mac.zip"));
        exec("cd " + path + " && unzip " + path + "/mac.zip");
    }

    return true;
})

function copyTemplateFiles(src, dst, top) {
    if(!fs.existsSync(app.getAppPath() + "/" + src)) {
        return;
    }
    if(top) {
        fs.readdirSync(app.getAppPath() + "/" + src).forEach(function (fname) {
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
    if(!fs.existsSync(path + "/txt/init.txt")) {
        return false;
    }

    Model.dir = path;
    refreshFiles("txt", Model.txt, ['.txt']);
    refreshFiles("bg", Model.bg, ['.png', '.jpg', '.jpeg']);
    refreshFiles("ch", Model.ch, ['.png', '.jpg', '.jpeg']);
    refreshFiles("bgm", Model.bgm, ['.ogg']);
    refreshFiles("se", Model.se, ['.ogg']);
})

function refreshFiles(subDir, list, allowExts) {
    list.length = 0;
    fs.readdirSync(Model.dir + "/" + subDir).forEach(function (file) {
        var ext = path.extname(file).toLowerCase();
        if(allowExts.includes(ext)) {
            list.push(file);
        }
    });
    list.sort();
}

//
// シナリオを開く
//
ipcMain.handle('openScenario', (event, file) => {
    var filePath = Model.dir + "/txt/" + file;
    var rawData = fs.readFileSync(filePath, { encoding: 'utf8' });

    Model.scenarioFile = file;
    Model.scenarioData = rawData.split(/\r\n|\n/);

    if(Model.scenarioData.length > 0) {
        if(Model.scenarioData[Model.scenarioData.length - 1] === "") {
            Model.scenarioData.pop();
        }
    }
})

//
// シナリオファイル名を取得する
//
ipcMain.handle('getScenarioName', (event) => {
    return Model.scenarioFile;
})

//
// シナリオデータを取得する
//
ipcMain.handle('getScenarioData', (event) => {
    return Model.scenarioData;
})

//
// シナリオデータを保存する
//
ipcMain.handle('setScenarioData', (event, data) => {
    Model.scenarioData = data;

    var filePath = Model.dir + "/txt/" + Model.scenarioFile;
    fs.writeFileSync(filePath, data.join("\n"));
})

//
// ゲームフォルダのURLを取得する
//
ipcMain.handle('getBaseUrl', (event) => {
    return "file:///" + Model.dir + "/";
})

//
// txtフォルダのファイルのリストを取得する
//
ipcMain.handle('getTxtList', (event) => {
    refreshFiles("txt", Model.txt, ['.txt']);
    return Model.txt;
})

//
// bgフォルダのファイルのリストを取得する
//
ipcMain.handle('getBgList', (event) => {
    refreshFiles("bg", Model.bg, ['.png', '.jpg', '.jpeg']);
    return Model.bg;
})

//
// chフォルダのファイルのリストを取得する
//
ipcMain.handle('getChList', (event) => {
    refreshFiles("ch", Model.ch, ['.png', '.jpg', '.jpeg']);
    return Model.ch;
})

//
// bgmフォルダのファイルのリストを取得する
//
ipcMain.handle('getBgmList', (event) => {
    refreshFiles("bgm", Model.bgm, ['.ogg']);
    return Model.bgm;
})

//
// seフォルダのファイルのリストを取得する
//
ipcMain.handle('getSeList', (event) => {
    refreshFiles("se", Model.se, ['.ogg']);
    return Model.se;
})

//
// movフォルダのファイルのリストを取得する
//
ipcMain.handle('getMovList', (event) => {
    refreshFiles("mov", Model.mov, [".wmv", ".mp4"]);
    return Model.mov;
})

//
// txtファイルを追加する
//
ipcMain.handle('addTxtFile', (event, srcFilePath) => {
    return copyAsset(srcFilePath, ['.txt'], "txt");
})

function copyAsset(srcFilePath, allowExts, subDir) {
    if(!allowExts.includes(path.extname(srcFilePath).toLowerCase())) {
        return false;
    }
      
    var srcFileName = path.basename(srcFilePath);
    var dstFileName = srcFileName.replace(/[^\x00-\x7F]/g, "_").replace(/ /g, "_");
    var dstDir = Model.dir + "/" + subDir;
    var dstPath = dstDir + "/" + dstFileName;

    if(!fs.existsSync(dstDir)) {
        if(!fs.mkdirSync(dstDir)) {
            return false;
        }
    }

    fs.writeFileSync(dstPath, fs.readFileSync(srcFilePath));
    return true;
}

//
// bgファイルを追加する
//
ipcMain.handle('addBgFile', (event, srcFilePath) => {
    return copyAsset(srcFilePath, ['.png', '.jpg', '.jpeg'], "bg");
})

//
// chファイルを追加する
//
ipcMain.handle('addChFile', (event, srcFilePath) => {
    return copyAsset(srcFilePath, ['.png', '.jpg', '.jpeg'], "ch");
})

//
// bgmファイルを追加する
//
ipcMain.handle('addBgmFile', (event, srcFilePath) => {
    return copyAsset(srcFilePath, ['.ogg'], "bgm");
})

//
// seファイルを追加する
//
ipcMain.handle('addSeFile', (event, srcFilePath) => {
    return copyAsset(srcFilePath, ['.ogg'], "se");
})

//
// movファイルを追加する
//
ipcMain.handle('addMovFile', (event, srcFilePath) => {
    return copyAsset(srcFilePath, [".wmv", ".mp4"], "mov");
})

//
// txtファイルを削除する
//
ipcMain.handle('removeTxtFile', (event, file) => {
    removeAsset("txt", file);
})

function removeAsset(subDir, file) {
    var filePath = Model.dir + "/" + subDir + "/" + file;
    if(fs.existsSync(filePath)) {
        fs.rmSync(filePath);
    }
}

//
// bgファイルを削除する
//
ipcMain.handle('removeBgFile', (event, file) => {
    removeAsset("bg", file);
})

//
// chファイルを削除する
//
ipcMain.handle('removeChFile', (event, file) => {
    removeAsset("ch", file);
})

//
// bgmファイルを削除する
//
ipcMain.handle('removeBgmFile', (event, file) => {
    removeAsset("bgm", file);
})

//
// seファイルを削除する
//
ipcMain.handle('removeSeFile', (event, file) => {
    removeAsset("se", file);
})

//
// movファイルを削除する
//
ipcMain.handle('removeMovFile', (event, file) => {
    removeAsset("mov", file);
})

//
// ゲーム実行
//

const exec = require('child_process').exec;

ipcMain.handle('playGame', (event) => {
    // セーブデータをクリアする
    fs.rmSync(Model.dir + "/sav", { recursive: true, force: true });

    // プレーヤを実行する
    if(process.platform === "win32") {
        var command = "cd " + Model.dir + " && " + "suika.exe";
        exec(command);
    } else if(process.platform === "darwin") {
        var command = "open " + Model.dir + "/suika.app";
        exec(command);
    }
})

ipcMain.handle('debugGame', (event, lineIndex) => {
    // セーブデータをクリアする
    fs.rmSync(Model.dir + "/sav", { recursive: true, force: true });

    // デバッガを実行する
    if(process.platform === "win32") {
        var command = "cd " + Model.dir + " && suika-pro.exe " + Model.scenarioFile + " " + lineIndex;
        exec(command);
    } else if(process.platform === "darwin") {
        var command = "open " + Model.dir + "/suika-pro.app --args scenario-file=" + Model.scenarioFile + " scenario-line=" + lineIndex;
        exec(command);
    }
})
