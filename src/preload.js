const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    getGameList: async () => await ipcRenderer.invoke('getGameList'),
    createGame: async (dir) => await ipcRenderer.invoke('createGame', dir),
    openGame: async (dir) => await ipcRenderer.invoke('openGame', dir),
    openScenario: async (file) => await ipcRenderer.invoke('openScenario', file),
    getScenarioName: async () => await ipcRenderer.invoke('getScenarioName'),
    getScenarioData: async () => await ipcRenderer.invoke('getScenarioData'),
    getBaseUrl: async () => await ipcRenderer.invoke('getBaseUrl'),
    getTxtList: async () => await ipcRenderer.invoke('getTxtList'),
    getBgList: async () => await ipcRenderer.invoke('getBgList'),
    getChList: async () => await ipcRenderer.invoke('getChList'),
    getBgmList: async () => await ipcRenderer.invoke('getBgmList'),
    getSeList: async () => await ipcRenderer.invoke('getSeList'),
    addTxtFile: async (filePath) => await ipcRenderer.invoke('addTxtFile', filePath),
    addBgFile: async (filePath) => await ipcRenderer.invoke('addBgFile', filePath),
    addChFile: async (filePath) => await ipcRenderer.invoke('addChFile', filePath),
    addBgmFile: async (filePath) => await ipcRenderer.invoke('addBgmFile', filePath),
    addSeFile: async (filePath) => await ipcRenderer.invoke('addSeFile', filePath)
})
