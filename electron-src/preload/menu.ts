import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('menu', {
	issues: () => ipcRenderer.send('menu:issues'),
	pullRequests: () => ipcRenderer.send('menu:pullRequests'),
	notifications: () => ipcRenderer.send('menu:notifications'),
});
