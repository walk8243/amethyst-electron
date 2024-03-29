import { contextBridge, ipcRenderer } from 'electron';
import type { ErrorData } from '../../types/Error';

contextBridge.exposeInMainWorld('setting', {
	display: () => ipcRenderer.invoke('setting:display'),
	submit: (data: SettingData) => ipcRenderer.send('setting:submit', data),
	cancel: () => ipcRenderer.send('setting:cancel'),
	color: () => ipcRenderer.invoke('app:color'),
});

contextBridge.exposeInMainWorld('error', {
	throw: (error: ErrorData) => ipcRenderer.send('error:throw', error),
	getPath: () => ipcRenderer.invoke('error:path'),
});

export type SettingData = { baseUrl: string; token?: string };
