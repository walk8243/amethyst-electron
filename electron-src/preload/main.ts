import { contextBridge, ipcRenderer } from 'electron';
import type { UserInfo } from '../../types/User';
import type { Issue, IssueSupplementMap } from '../../types/Issue';
import type { IssueFilterTypes } from '../../types/IssueFilter';
import type { ErrorData } from '../../types/Error';

contextBridge.exposeInMainWorld('electron', {
	issue: (issue: Issue) => ipcRenderer.invoke('github:issue', issue),
	open: (url: string) => ipcRenderer.send('browser:open', url),
	reload: () => ipcRenderer.invoke('browser:reload'),
	history: (ope: 'back' | 'forward') =>
		ipcRenderer.invoke('browser:history', ope),
	copy: (url: string) => ipcRenderer.send('browser:copy', url),
	search: (query: string, direction: 'next' | 'back') =>
		ipcRenderer.invoke('browser:search', query, direction),
	load: (
		callback: (value: {
			url: string;
			canGoBack: boolean;
			canGoForward: boolean;
		}) => void,
	) => ipcRenderer.on('browser:load', (_event, value) => callback(value)),

	ready: () => ipcRenderer.send('app:ready'),
	color: () => ipcRenderer.invoke('app:color'),
	pushUser: (callback: (user: UserInfo) => void) =>
		ipcRenderer.on('app:pushUser', (_event, value) => callback(value)),
	pushIssues: (callback: (issues: Issue[]) => void) =>
		ipcRenderer.on('app:pushIssues', (_event, value) => callback(value)),
	pushUpdatedAt: (callback: (updatedAt: string) => void) =>
		ipcRenderer.on('app:pushUpdatedAt', (_event, value) => callback(value)),
	pushIssueSupplementMap: (callback: (map: IssueSupplementMap) => void) =>
		ipcRenderer.on('app:pushIssueSupplementMap', (_event, value) =>
			callback(value),
		),
	setColor: (mode: 'light' | 'dark') => ipcRenderer.send('app:setColor', mode),
	proxyUserIcon: (userId: number) =>
		ipcRenderer.invoke('app:proxyUserIcon', userId),

	showFilterMenu: (type: IssueFilterTypes) =>
		ipcRenderer.send('app:showFilterMenu', type),
	showIssueCardMenu: (issue: Issue) =>
		ipcRenderer.send('app:showIssueCardMenu', issue),
});

contextBridge.exposeInMainWorld('error', {
	throw: (error: ErrorData) => ipcRenderer.send('error:throw', error),
	show: (callback: (error: ErrorData) => void) =>
		ipcRenderer.on('error:show', (_event, error) => callback(error)),
	getPath: () => ipcRenderer.invoke('error:path'),
});
