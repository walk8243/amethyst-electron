import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('update', {});
