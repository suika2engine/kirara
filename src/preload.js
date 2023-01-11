const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    openModel: async (data) => await ipcRenderer.invoke('openModel', data),
    getBaseUrl: async () => await ipcRenderer.invoke('getBaseUrl'),
    getTxtList: async () => await ipcRenderer.invoke('getTxtList'),
    getBgList: async () => await ipcRenderer.invoke('getBgList'),
    getChList: async () => await ipcRenderer.invoke('getChList'),
    getBgmList: async () => await ipcRenderer.invoke('getBgmList'),
    getSeList: async () => await ipcRenderer.invoke('getSeList')
})
