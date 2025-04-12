import { join } from 'node:path';
import {
	app,
	BrowserWindow,
	ipcMain,
	Menu,
	session,
	shell,
	WebContentsView,
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

	const menuView = setupMenuView(mainWindow);
	const webview = setupWebview(mainWindow);
	const { updateWindow } = setupModalWindow({
		mainWindow,
		menuView,
		webview,
	});
	setupErrorHandling({
		mainWindow,
		webview,
	});
	setupResizedSetting({
		mainWindow,
		menuView,
		webview,
	});

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
	ipcMain.on('browser:open', (_event, url: string) => {
		shell.openExternal(url);
	});

	return mainWindow;
};
const setupMenuView = (mainWindow: BrowserWindow) => {
	const menuView = windowUtils.createMenuView();
	mainWindow.contentView.addChildView(menuView);
	return menuView;
};
const setupWebview = (mainWindow: BrowserWindow) => {
	const webview = windowUtils.createWebview();
	mainWindow.contentView.addChildView(webview);

	ipcMain.on('menu:issues', () => {
		webview.webContents.loadURL('https://github.com/issues');
	});
	ipcMain.on('menu:pullRequests', () => {
		webview.webContents.loadURL('https://github.com/pulls');
	});
	ipcMain.on('menu:notifications', () => {
		webview.webContents.loadURL('https://github.com/notifications');
	});

	return webview;
};
const setupModalWindow = ({
	mainWindow,
	menuView,
	webview,
}: {
	mainWindow: BrowserWindow;
	menuView: WebContentsView;
	webview: WebContentsView;
}) => {
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
	windowUtils.putWebview(mainWindow, menuView, webview);
	mainWindow.show();

	return {
		settingWindow,
		aboutWindow,
		updateWindow,
	};
};
const setupErrorHandling = ({
	mainWindow,
	webview,
}: {
	mainWindow: BrowserWindow;
	webview: WebContentsView;
}) => {
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
const setupResizedSetting = ({
	mainWindow,
	menuView,
	webview,
}: {
	mainWindow: BrowserWindow;
	menuView: WebContentsView;
	webview: WebContentsView;
}) => {
	mainWindow
		.on('maximize', () => {
			windowUtils.putWebview(mainWindow, menuView, webview);
		})
		.on('unmaximize', () => {
			windowUtils.putWebview(mainWindow, menuView, webview);
		})
		.on('resized', () => {
			windowUtils.putWebview(mainWindow, menuView, webview);
		})
		.on('enter-full-screen', () => {
			windowUtils.putWebview(mainWindow, menuView, webview, {
				noHeaderFlag: true,
			});
		})
		.on('leave-full-screen', () => {
			windowUtils.putWebview(mainWindow, menuView, webview);
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
