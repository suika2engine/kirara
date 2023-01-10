const electron = require('electron');

process.once('loaded', () => {
    global.ipcRenderer = electron.ipcRenderer;
    global.app = electron.remote.app;
});
