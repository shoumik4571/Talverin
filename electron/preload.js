const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showAlarm: (alarmData) => ipcRenderer.send('show-alarm', alarmData),
  onAlarmAction: (callback) => ipcRenderer.on('alarm-action', callback),
});