import { join } from 'node:path';
import {
	app,
	BrowserWindow,
	clipboard,
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

import { gainGithubAllData, scheduledGainGithubIssues } from './github';
import { createMenu } from './models/AppMenu';
import { createFilterMenu, createIssueCardMenu } from './models/ContextMenu';
import { handleErrorDisplay } from './utils/error';
import { checkStoreData } from './utils/github';
import { announceUpdate } from './utils/release';
import { getLoadedUrl } from './utils/render';
import { store } from './utils/store';
import * as windowUtils from './utils/window';
import type { Issue } from '../types/Issue';
import type { IssueFilterTypes } from '../types/IssueFilter';
import type { ErrorData } from '../types/Error';

export const main = async () => {
	const mainWindow = setupMainWindow();
	const storeDataFlag = checkStoreData();

	await prepareNext('./renderer');
	mainWindow.loadURL(getLoadedUrl());
	const initialDataPromise = storeDataFlag.isInvalid()
		? Promise.resolve()
		: gainGithubAllData(true);

	const webview = setupWebview(mainWindow);
	const { updateWindow } = setupModalWindow({
		mainWindow,
		webview,
		settingShowFlag: storeDataFlag.isInvalid(),
	});
	setupErrorHandling(mainWindow, webview);
	setupResizedSetting(mainWindow, webview);
	setupContextMenu();

	initialDataPromise.then(() => {
		scheduledGainGithubIssues();
	});
	await announceUpdate(updateWindow, false);
	await setupDevtools();
};

const setupMainWindow = () => {
	const mainWindow = windowUtils.createMain();
	let isFirst = true;
	ipcMain.handle('app:version', () => `v${app.getVersion()}`);
	ipcMain.handle('app:color', () => store.get('color', 'light'));
	ipcMain.on('app:ready', (_event) => {
		log.verbose('App renderer is ready');
		sendMainData(mainWindow, isFirst);
		isFirst = false;
	});
	ipcMain.on('app:setColor', (_event, mode: 'light' | 'dark') => {
		log.verbose('App ColorMode is changed', mode);
		store.set('color', mode);
	});

	return mainWindow;
};
const setupWebview = (mainWindow: BrowserWindow) => {
	const webview = windowUtils.createWebview();
	mainWindow.contentView.addChildView(webview);
	webview.webContents.loadURL('https://github.com/');
	windowUtils.putWebview(mainWindow, webview);

	ipcMain.handle('github:issue', async (_event, issue: Issue) => {
		store.set(`issueSupplementMap.${issue.key}.isRead`, true);
		webview.webContents.loadURL(issue.url);
	});
	ipcMain.on('browser:open', (_event, url: string) => {
		shell.openExternal(url);
	});
	ipcMain.handle('browser:reload', (_event) => {
		webview.webContents.reload();
	});
	ipcMain.handle('browser:history', (_event, ope: 'back' | 'forward') => {
		if (ope === 'back') {
			webview.webContents.navigationHistory.goBack();
		}
		if (ope === 'forward') {
			webview.webContents.navigationHistory.goForward();
		}

		return {
			canGoBack: webview.webContents.navigationHistory.canGoBack(),
			canGoForward: webview.webContents.navigationHistory.canGoForward(),
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

	webview.webContents.session.cookies.on('changed', async (_event, cookie, cause) => {
		if (cause !== 'overwrite') return;
		log.debug('Webviewのcookieが更新されました', {
			domain: cookie.domain,
			name: cookie.name,
			sameSite: cookie.sameSite,
		});

		try {
			const cookies = await mainWindow.webContents.session.cookies.get({ domain: cookie.domain, name: cookie.name });
			if (cookies.length > 0) return;
			await mainWindow.webContents.session.cookies.set({
				url: `${cookie.secure ? 'https' : 'http'}://${cookie.domain}${cookie.path ?? '/'}`,
				name: cookie.name,
				value: cookie.value,
				expirationDate: cookie.expirationDate,
				secure: cookie.secure,
				httpOnly: cookie.httpOnly,
				sameSite: 'lax',
			});
			log.debug('main-windowのcookieを設定しました', {
				domain: cookie.domain,
				name: cookie.name,
				expirationDate: cookie.expirationDate,
			});
		} catch (error) {
			log.warn('main-windowのcookieを設定できませんでした', error);
		}
	});

	webview.webContents.on('did-finish-load', () => {
		mainWindow.webContents.send('browser:load', {
			url: webview.webContents.getURL(),
			canGoBack: webview.webContents.navigationHistory.canGoBack(),
			canGoForward: webview.webContents.navigationHistory.canGoForward(),
		});
	});
	return webview;
};
const setupModalWindow = ({
	mainWindow,
	webview,
	settingShowFlag,
}: {
	mainWindow: BrowserWindow;
	webview: WebContentsView;
	settingShowFlag: boolean;
}) => {
	const settingWindow = windowUtils.createSetting(mainWindow);
	const aboutWindow = windowUtils.createAbout(mainWindow);
	const updateWindow = windowUtils.createUpdate(mainWindow);
	const menu = createMenu({
		mainWindow,
		webview,
		settingWindow,
		aboutWindow,
		updateWindow,
	});
	Menu.setApplicationMenu(menu);
	mainWindow.show();

	if (settingShowFlag) {
		settingWindow.show();
	}

	return {
		settingWindow,
		aboutWindow,
		updateWindow,
	};
};
const setupErrorHandling = (
	mainWindow: BrowserWindow,
	webview: WebContentsView,
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
	webview: WebContentsView,
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
const setupContextMenu = () => {
	ipcMain.on('app:showFilterMenu', (event, type: IssueFilterTypes) => {
		log.verbose('Issueフィルタのコンテキストメニューを表示します', type);
		const window = BrowserWindow.fromWebContents(event.sender);
		if (!window) return;
		const menu = createFilterMenu(type);
		menu.popup({ window });
	});
	ipcMain.on('app:showIssueCardMenu', (event, issue: Issue) => {
		log.verbose(
			'Issueカードのコンテキストメニューを表示します',
			`${issue.repositoryName}#${issue.number}`,
		);
		const window = BrowserWindow.fromWebContents(event.sender);
		if (!window) return;
		const menu = createIssueCardMenu(issue);
		menu.popup({ window });
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

const sendMainData = (mainWindow: BrowserWindow, isFirst: boolean) => {
	if (store.has('userInfo')) {
		mainWindow.webContents.send('app:pushUser', store.get('userInfo'));
	}
	if (store.has('issueData')) {
		mainWindow.webContents.send(
			'app:pushIssues',
			store.get('issueData')?.issues ?? [],
		);
		mainWindow.webContents.send(
			'app:pushUpdatedAt',
			store.get('issueData')?.updatedAt ?? '',
		);
	}
	if (store.has('issueSupplementMap')) {
		mainWindow.webContents.send(
			'app:pushIssueSupplementMap',
			store.get('issueSupplementMap'),
		);
	}

	if (!isFirst) return;
	store.onDidChange('userInfo', (userInfo) => {
		log.debug('蓄積しているUserInfoが更新されました');
		mainWindow.webContents.send('app:pushUser', userInfo ?? {});
	});
	store.onDidChange('issueData', (data) => {
		log.verbose('蓄積しているIssueDataが更新されました');
		if (!data) return;
		mainWindow.webContents.send('app:pushUpdatedAt', data.updatedAt);
		mainWindow.webContents.send('app:pushIssues', data.issues ?? []);
	});
	store.onDidChange('issueSupplementMap', (map) => {
		log.debug('蓄積しているIssueの追加データが更新されました');
		if (!map) return;
		mainWindow.webContents.send('app:pushIssueSupplementMap', map);
	});
};
