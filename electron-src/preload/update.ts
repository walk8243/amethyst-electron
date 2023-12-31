import { contextBridge, ipcRenderer } from 'electron';
import type { UpdateStatus } from '../../types/Update';

contextBridge.exposeInMainWorld('update', {
	version: (status: UpdateStatus) =>
		ipcRenderer.invoke('update:version', status),
	download: () => ipcRenderer.send('update:download'),
	copy: (command: string) => ipcRenderer.send('update:copy', command),
	openRelease: () => ipcRenderer.send('update:openRelease'),
	openLink: (url: string) => ipcRenderer.send('browser:open', url),
	close: () => ipcRenderer.send('update:close'),
});
