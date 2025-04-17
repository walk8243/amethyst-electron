import { join } from 'node:path';
import { BrowserWindow, clipboard, ipcMain, WebContentsView } from 'electron';
import log from 'electron-log';
import { getLoadedUrl } from './render';
import { createWebviewMenu } from '../models/ContextMenu';

export const isMac = process.platform === 'darwin';

export const createMain = () => {
	const mainWindow = new BrowserWindow({
		width: 1500,
		height: 800,
		minWidth: 1300,
		minHeight: 600,
		show: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: join(__dirname, '../preload', 'main.js'),
		},
	});

	return mainWindow;
};

export const createSetting = (parentWindow: BrowserWindow) => {
	const settingWindow = new BrowserWindow({
		title: 'Settings',
		parent: parentWindow,
		modal: true,
		width: 300,
		height: 500,
		show: false,
		resizable: false,
		closable: false,
		fullscreenable: false,
		minimizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: join(__dirname, '../preload', 'setting.js'),
		},
	});
	settingWindow.removeMenu();
	settingWindow.loadURL(getLoadedUrl('setting'));

	return settingWindow;
};

export const createAbout = (parentWindow: BrowserWindow) => {
	const aboutWindow = new BrowserWindow({
		title: 'About',
		parent: parentWindow,
		modal: true,
		width: 500,
		height: 270 + (isMac ? 0 : 27),
		show: false,
		resizable: false,
		closable: false,
		fullscreenable: false,
		minimizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: join(__dirname, '../preload', 'about.js'),
		},
	});
	aboutWindow.removeMenu();
	aboutWindow.loadURL(getLoadedUrl('about'));

	return aboutWindow;
};

export const createUpdate = (parentWindow: BrowserWindow) => {
	const updateWindow = new BrowserWindow({
		title: 'Amethyst Update',
		parent: parentWindow,
		modal: true,
		width: 500,
		height: 640,
		show: false,
		resizable: false,
		closable: false,
		fullscreenable: false,
		minimizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: join(__dirname, '../preload', 'update.js'),
		},
	});
	updateWindow.removeMenu();
	updateWindow.loadURL(getLoadedUrl('update'));

	ipcMain.on('update:copy', (_event, command: string) => {
		clipboard.writeText(command);
	});

	return updateWindow;
};

export const createWebview = () => {
	const webview = new WebContentsView({});
	webview.webContents.loadURL('https://github.com/');
	webview.webContents.on('context-menu', (_event, params) => {
		log.debug('webview context-menu', params);
		const menu = createWebviewMenu(params);
		menu.popup();
	});

	return webview;
};

const boundPosition = { x: 600, y: 48 } as const;
export const putWebview = (
	mainWindow: BrowserWindow,
	webview: WebContentsView,
	{ noHeaderFlag }: WebviewPutOptions = {},
) => {
	const bounds = mainWindow.getBounds();
	const option = { isNoHeader: noHeaderFlag === true, isMac };
	const boundsPlan = {
		x: boundPosition.x,
		y: boundPosition.y,
		width: calcWebviewWidth(bounds, option),
		height: calcWebviewHeight(bounds, option),
	};
	webview.setBounds(boundsPlan);
};
const calcWebviewWidth = (
	mainWindowBounds: Electron.Rectangle,
	option: { isNoHeader: boolean; isMac: boolean },
) => {
	let width = mainWindowBounds.width - boundPosition.x;
	if (!option.isMac) {
		width -= 16;
	}
	return width;
};
const calcWebviewHeight = (
	mainWindowBounds: Electron.Rectangle,
	option: { isNoHeader: boolean; isMac: boolean },
) => {
	const height = mainWindowBounds.height - boundPosition.y;
	if (option.isNoHeader) {
		return height;
	}
	return height - (option.isMac ? 27 : 59);
};

export type WebviewPutOptions = {
	noHeaderFlag?: boolean;
};
