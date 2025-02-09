import { join } from 'node:path';
import {
	app,
	BrowserView,
	BrowserWindow,
	clipboard,
	ipcMain,
	Menu,
	session,
	shell,
} from 'electron';
import prepareNext from 'electron-next';
import isDev from 'electron-is-dev';
import log from 'electron-log/main';
import installExtension, {
	REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

import { createMenu } from './models/AppMenu';
import { handleErrorDisplay } from './utils/error';
import { announceUpdate } from './utils/release';
import { getLoadedUrl } from './utils/render';
import { store } from './utils/store';
import * as windowUtils from './utils/window';
import type { ErrorData } from '../types/Error';

export const main = async () => {
	const mainWindow = setupMainWindow();

	await prepareNext('./renderer');
	mainWindow.loadURL(getLoadedUrl());

	const webview = setupWebview(mainWindow);
	const { updateWindow } = setupModalWindow(mainWindow);
	setupErrorHandling(mainWindow, webview);
	setupResizedSetting(mainWindow, webview);

	await announceUpdate(updateWindow, false);
	await setupDevtools();
};

const setupMainWindow = () => {
	const mainWindow = windowUtils.createMain();
	ipcMain.handle('app:version', () => `v${app.getVersion()}`);
	ipcMain.handle('app:color', () => store.get('color', 'light'));
	ipcMain.on('app:ready', (_event) => {
		log.verbose('App renderer is ready');
	});
	ipcMain.on('app:setColor', (_event, mode: 'light' | 'dark') => {
		log.verbose('App ColorMode is changed', mode);
		store.set('color', mode);
	});

	return mainWindow;
};
const setupWebview = (mainWindow: BrowserWindow) => {
	const webview = windowUtils.createWebview();
	mainWindow.setBrowserView(webview);
	windowUtils.putWebview(mainWindow, webview);
	ipcMain.on('browser:open', (_event, url: string) => {
		shell.openExternal(url);
	});
	ipcMain.handle('browser:reload', (_event) => {
		webview.webContents.reload();
	});
	ipcMain.handle('browser:history', (_event, ope: 'back' | 'forward') => {
		if (ope === 'back') {
			webview.webContents.goBack();
		}
		if (ope === 'forward') {
			webview.webContents.goForward();
		}

		return {
			canGoBack: webview.webContents.canGoBack(),
			canGoForward: webview.webContents.canGoForward(),
		};
	});
	ipcMain.on('browser:copy', (_event, url: string) => {
		clipboard.writeText(url);
	});
	ipcMain.handle(
		'browser:search',
		async (_event, query: string, direction: 'next' | 'back') => {
			if (!query) {
				webview.webContents.stopFindInPage('clearSelection');
				return;
			}
			webview.webContents.findInPage(query, { forward: direction === 'next' });
		},
	);

	webview.webContents.on('did-finish-load', () => {
		mainWindow.webContents.send('browser:load', {
			url: webview.webContents.getURL(),
			canGoBack: webview.webContents.canGoBack(),
			canGoForward: webview.webContents.canGoForward(),
		});
	});
	return webview;
};
const setupModalWindow = (mainWindow: BrowserWindow) => {
	const settingWindow = windowUtils.createSetting(mainWindow);
	const aboutWindow = windowUtils.createAbout(mainWindow);
	const updateWindow = windowUtils.createUpdate(mainWindow);
	const menu = createMenu({
		mainWindow,
		settingWindow,
		aboutWindow,
		updateWindow,
	});
	Menu.setApplicationMenu(menu);
	mainWindow.show();

	return {
		settingWindow,
		aboutWindow,
		updateWindow,
	};
};
const setupErrorHandling = (
	mainWindow: BrowserWindow,
	webview: BrowserView,
) => {
	const logPath = join(
		app.getPath('userData'),
		windowUtils.isMac ? `Logs/${app.name}` : 'logs',
		'main.log',
	);
	log.errorHandler.startCatching({
		onError: ({ error, processType }) => {
			if (processType === 'renderer') {
				return;
			}
			log.debug('mainプロセスでエラーが発生しました', error.stack);
			handleErrorDisplay({
				error: {
					name: error.name,
					message: error.message,
					stack: error.stack ?? `${error.name}: ${error.message}`,
				},
				mainWindow,
				webview,
			});
		},
	});
	ipcMain.on('error:throw', (_event, error: ErrorData) => {
		log.debug('rendererプロセスでエラーが発生しました', error.stack);
		handleErrorDisplay({ error, mainWindow, webview });
	});
	ipcMain.handle('error:path', () => logPath);
};
const setupResizedSetting = (
	mainWindow: BrowserWindow,
	webview: BrowserView,
) => {
	mainWindow
		.on('maximize', () => {
			windowUtils.putWebview(mainWindow, webview);
		})
		.on('unmaximize', () => {
			windowUtils.putWebview(mainWindow, webview);
		})
		.on('resized', () => {
			windowUtils.putWebview(mainWindow, webview);
		})
		.on('enter-full-screen', () => {
			windowUtils.putWebview(mainWindow, webview, { noHeaderFlag: true });
		})
		.on('leave-full-screen', () => {
			windowUtils.putWebview(mainWindow, webview);
		});
};
const setupDevtools = async () => {
	if (isDev) {
		await installExtension(REACT_DEVELOPER_TOOLS);
		await session.defaultSession.loadExtension(
			join(app.getPath('userData'), 'extensions', REACT_DEVELOPER_TOOLS.id),
		);
	}
};
