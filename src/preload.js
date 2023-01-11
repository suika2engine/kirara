const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    listGames: async (dir) => await ipcRenderer.invoke('listGames'),
    createGame: async (dir) => await ipcRenderer.invoke('createGame', dir),
    openGame: async (dir) => await ipcRenderer.invoke('openGame', dir),
    getBaseUrl: async () => await ipcRenderer.invoke('getBaseUrl'),
    getTxtList: async () => await ipcRenderer.invoke('getTxtList'),
    getBgList: async () => await ipcRenderer.invoke('getBgList'),
    getChList: async () => await ipcRenderer.invoke('getChList'),
    getBgmList: async () => await ipcRenderer.invoke('getBgmList'),
    getSeList: async () => await ipcRenderer.invoke('getSeList')
})
