import {
	app,
	BrowserWindow,
	dialog,
	ipcMain,
	Notification,
	shell,
} from 'electron';
import log from 'electron-log/main';
import dayjs from 'dayjs';
import semver from 'semver';
import {
	gainUserInfo,
	gainIssues,
	githubAppSettings,
	viewLatestRelease,
} from './utils/github';
import { store } from './utils/store';
import type { Issue } from '../types/Issue';
import type { UpdateStatus } from '../types/Update';

const IssueGainInterval = 300000 as const; // 5分
let latestIssueGainTime: dayjs.Dayjs = ((date: string) => {
	return date
		? dayjs(date)
		: dayjs().subtract(
				githubAppSettings.targetTerm.value,
				githubAppSettings.targetTerm.unit,
			);
})(store.get('issueData')?.updatedAt);
let issueTimer: NodeJS.Timeout;
let isBlockGainIssues: boolean = false;

export const gainGithubAllData = async (isBoot: boolean) => {
	log.debug('main.gainGithubAllData を実行します');
	try {
		await Promise.all([gainGithubUser(), gainGithubIssues()]);
	} catch (error) {
		log.error(
			new Error('GitHub APIからのデータ取得に失敗しました', { cause: error }),
		);
		if (isBoot) {
			ipcMain.once('app:ready', () => {
				showErrorDialog();
			});
		} else {
			showErrorDialog();
		}
	}
};

export const gainGithubUser = async () => {
	log.debug('main.gainGithubUser を実行します');
	const userInfo = await gainUserInfo();

	store.set('userInfo', userInfo);
	return userInfo;
};
export const gainGithubIssues = async () => {
	log.debug('main.gainGithubIssues を実行します');
	if (isBlockGainIssues) return;
	isBlockGainIssues = true;

	const now = dayjs();
	const issues = await gainIssues(latestIssueGainTime);

	latestIssueGainTime = now;
	store.set('issueData', {
		updatedAt: now.toISOString(),
		issues: joinIssueData(issues),
	});

	if (issues.length > 0) {
		updateIssueSupplementMap(issues);
		noticeIssues();
	}

	setTimeout(() => {
		isBlockGainIssues = false;
	}, 5000);
	return issues;
};

export const scheduledGainGithubIssues = () => {
	issueTimer = setInterval(() => {
		gainGithubIssues();
	}, IssueGainInterval);
};
export const refreshIssueTimer = () => {
	if (issueTimer) {
		issueTimer.refresh();
	}
};

export const announceUpdate = async (
	updateWindow: BrowserWindow,
	isForceShow: boolean = true,
) => {
	const result = await checkUpdate();

	ipcMain.removeHandler('update:version');
	ipcMain.handle('update:version', (_event) => result);

	ipcMain.removeAllListeners('update:download');
	ipcMain.removeAllListeners('update:openRelease');
	ipcMain.on('update:download', () => {
		log.debug('[update:download] MSIファイルのダウンロードを開始します');
		updateWindow.webContents.downloadURL(
			`https://github.com/walk8243/amethyst-electron/releases/download/${result.latestRelease}/amethyst-${result.latestRelease}-win.msi`,
		);
	});
	ipcMain.on('update:openRelease', () => {
		log.debug('[update:openRelease] リリースページを開きます');
		shell.openExternal(
			`https://github.com/walk8243/amethyst-electron/releases/tag/${result.latestRelease}`,
		);
	});

	if (!isForceShow && !result.canUpdate) return;
	setImmediate(() => {
		updateWindow.show();
	});
};
const checkUpdate = async (): Promise<UpdateStatus> => {
	const latestRelease = await viewLatestRelease();
	const currentVersion = app.getVersion();
	log.verbose('versions:', {
		appVersion: currentVersion,
		latestRelease: latestRelease.tag,
	});
	return {
		canUpdate: semver.gt(latestRelease.tag, currentVersion),
		appVersion: currentVersion,
		latestRelease: latestRelease.tag,
	};
};

const joinIssueData = (issues: Issue[]) => {
	return issues.concat(
		(store.get('issueData')?.issues ?? []).filter(
			(issue) => !issues.some((i) => i.key === issue.key),
		),
	);
};

const updateIssueSupplementMap = (issues: Issue[]) => {
	const map = store.get('issueSupplementMap');
	issues.forEach((issue) => {
		if (!map[issue.key]) return;
		map[issue.key].isRead = false;
	});
	store.set('issueSupplementMap', map);
};

const noticeIssues = () => {
	const notification = new Notification({
		title: 'Issueが更新されました',
		body: '更新されたIssue・PRがあります。Issue・PRを確認してください。',
	});
	notification.show();
};

const showErrorDialog = () => {
	dialog.showErrorBox(
		'GitHub APIからのデータ取得に失敗しました',
		'tokenの有効期限が切れている可能性があります。設定画面からtokenを再設定してください。',
	);
	app.applicationMenu?.items
		.find((item) => item.label === 'Amethyst')
		?.submenu?.items.find((item) => item.label === 'Preferences')
		?.click();
};
