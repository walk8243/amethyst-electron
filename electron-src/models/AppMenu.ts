import {
	BrowserWindow,
	ipcMain,
	Menu,
	MenuItemConstructorOptions,
	safeStorage,
	shell,
} from 'electron';
import isDev from 'electron-is-dev';

import { announceUpdate } from '../utils/release';
import { store } from '../utils/store';
import { isMac } from '../utils/window';
import type { SettingData } from '../../types/Setting';

export const createMenu = ({
	mainWindow,
	settingWindow,
	aboutWindow,
	updateWindow,
}: {
	mainWindow: BrowserWindow;
	settingWindow: BrowserWindow;
	aboutWindow: BrowserWindow;
	updateWindow: BrowserWindow;
}): Menu => {
	const menu = Menu.buildFromTemplate([
		{
			label: 'Amethyst',
			submenu: appMenu({ settingWindow, aboutWindow }),
		},
		{
			label: 'ファイル',
			submenu: fileMenu(),
		},
		{
			label: '編集',
			submenu: editMenu(),
		},
		{
			label: '表示',
			submenu: viewMenu({ mainWindow }),
		},
		{
			label: 'ウィンドウ',
			submenu: windowMenu(),
		},
		{
			role: 'help',
			label: 'ヘルプ',
			submenu: helpMenu({ updateWindow }),
		},
	]);

	ipcMain
		.on(
			'setting:submit',
			(_event: Electron.IpcMainEvent, data: SettingData) => {
				store.set('githubSetting', {
					baseUrl: data.baseUrl,
					token:
						data.token &&
						safeStorage.encryptString(data.token).toString('base64'),
				});
				settingWindow.hide();
			},
		)
		.on('setting:cancel', (_event: Electron.IpcMainEvent) => {
			settingWindow.hide();
		})
		.on('about:close', (_event: Electron.IpcMainEvent) => {
			aboutWindow.hide();
		})
		.on('update:close', (_event: Electron.IpcMainEvent) => {
			updateWindow.hide();
		});

	return menu;
};

const appMenu = ({
	settingWindow,
	aboutWindow,
}: {
	settingWindow: BrowserWindow;
	aboutWindow: BrowserWindow;
}): MenuItemConstructorOptions[] => [
	{
		label: 'Amethystについて',
		click: () => aboutWindow.show(),
	},
	{ type: 'separator' },
	{
		label: '環境設定',
		accelerator: 'CmdOrCtrl+,',
		click: () => settingWindow.show(),
	},
	...appMacMenu,
	{ type: 'separator' },
	{ role: 'quit', label: 'Amethystを終了' },
];
const appMacMenu: MenuItemConstructorOptions[] = isMac
	? [
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide', label: 'Amethystを隠す' },
			{ role: 'hideOthers', label: 'その他を隠す' },
			{ role: 'unhide', label: 'すべてを表示', enabled: false },
		]
	: [];

const fileMenu = (): MenuItemConstructorOptions[] => [
	{ role: 'close', label: '閉じる' },
];

const editMenu = (): MenuItemConstructorOptions[] => [
	{ role: 'undo', label: '元に戻す', enabled: false },
	{ role: 'redo', label: 'やり直す', enabled: false },
	{ type: 'separator' },
	{ role: 'cut', label: '切り取り', enabled: false },
	{ role: 'copy', label: 'コピー', enabled: false },
	{ role: 'paste', label: '貼り付け', enabled: false },
	{
		role: 'pasteAndMatchStyle',
		label: '貼り付けてスタイルを合わせる',
		enabled: false,
	},
	{ role: 'delete', label: '削除', enabled: false },
	{ role: 'selectAll', label: 'すべて選択', enabled: false },
	{ type: 'separator' },
	{
		label: 'スピーチ',
		submenu: [
			{ role: 'startSpeaking', label: '読み上げを開始', enabled: false },
			{ role: 'stopSpeaking', label: '読み上げを停止', enabled: false },
		],
	},
];

const viewMenu = ({
	mainWindow,
}: {
	mainWindow: BrowserWindow;
}): MenuItemConstructorOptions[] => [
	...viewDevMenu(mainWindow),
	{ type: 'separator' },
	{ role: 'togglefullscreen', label: 'フルスクリーン', enabled: false },
];
const viewDevMenu = (
	mainWindow: BrowserWindow,
): MenuItemConstructorOptions[] =>
	isDev
		? [
				{
					label: '開発者ツールを開く',
					accelerator: 'CmdOrCtrl+Shift+I',
					click: () => {
						if (mainWindow.webContents.isDevToolsOpened()) {
							mainWindow.webContents.closeDevTools();
						} else {
							mainWindow.webContents.openDevTools({ mode: 'detach' });
						}
					},
				},
			]
		: [];

const windowMenu = (): MenuItemConstructorOptions[] => [
	{ role: 'minimize', label: '最小化' },
	...windowMacMenu,
	{ role: 'close', label: '閉じる' },
];
const windowMacMenu: MenuItemConstructorOptions[] = isMac
	? [
			{ role: 'zoom', label: '拡大' },
			{ type: 'separator' },
			{ role: 'front', label: '手前に移動' },
			{ type: 'separator' },
			{ role: 'window', label: 'サブメニュー' },
		]
	: [{ type: 'separator' }];

const helpMenu = ({
	updateWindow,
}: {
	updateWindow: BrowserWindow;
}): MenuItemConstructorOptions[] => [
	{ role: 'about', label: 'Electronについて' },
	{
		label: 'Electronをもっと知る',
		click: () => {
			shell.openExternal('https://electronjs.org');
		},
	},
	{ type: 'separator' },
	{
		label: 'Amethystの更新を確認',
		click: () => {
			announceUpdate(updateWindow);
		},
	},
];
