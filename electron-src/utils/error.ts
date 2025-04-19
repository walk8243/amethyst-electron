import { BrowserWindow, dialog, WebContentsView } from 'electron';
import log from 'electron-log/main';
import { ErrorData } from '../../types/Error';

const CREATE_ISSUE_URL =
	'https://github.com/walk8243/amethyst-electron/issues/new?template=bug_report.md&labels=bug';
let alreadyError: boolean = false;

export const handleErrorDisplay = ({
	error,
	mainWindow,
	webview,
}: {
	error: ErrorData;
	mainWindow: BrowserWindow;
	webview: WebContentsView;
}) => {
	log.error(`${error.name}: ${error.message}`);
	sendError(error, mainWindow);
	if (alreadyError) {
		return;
	}

	alreadyError = true;
	viewReportIssue(webview);
	showErrorDialog(mainWindow);
};
const sendError = (error: ErrorData, mainWindow: BrowserWindow) => {
	mainWindow.webContents.send('error:show', error);
};
const viewReportIssue = (webview: WebContentsView) => {
	webview.webContents.loadURL(CREATE_ISSUE_URL).catch((error) => {
		log.error('エラー報告用のIssueを表示できませんでした', error);
	});
};
const showErrorDialog = (mainWindow: BrowserWindow) => {
	dialog.showMessageBox(mainWindow, {
		title: 'エラーが発生しました',
		message: 'エラー内容のご報告にご協力をどうかお願い致します。',
		type: 'error',
	});
};
