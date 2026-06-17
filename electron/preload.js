const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (opts) => ipcRenderer.invoke('save-file-dialog', opts),
  writeFile: (opts) => ipcRenderer.invoke('write-file', opts),
  onMenuOpen: (cb) => ipcRenderer.on('menu-open', cb),
  onMenuSave: (cb) => ipcRenderer.on('menu-save', cb),
  onMenuSaveAs: (cb) => ipcRenderer.on('menu-save-as', cb),
});
