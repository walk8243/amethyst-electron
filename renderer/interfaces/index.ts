import type { PaletteMode } from '@mui/material';
import type { UserInfo } from '../../types/User';
import type { Issue, IssueSupplementMap } from '../../types/Issue';
import type { UpdateStatus } from '../../types/Update';
import type { ErrorData } from '../../types/Error';
import type { IssueFilterTypes } from '../../types/IssueFilter';

declare global {
	interface Window {
		electron: {
			issue: (issue: Issue) => Promise<void>;
			open: (url: string) => void;
			reload: () => void;
			history: (
				ope: 'back' | 'forward',
			) => Promise<{ canGoBack: boolean; canGoForward: boolean }>;
			copy: (url: string) => void;
			search: (query: string, direction: 'next' | 'back') => Promise<void>;
			load: (
				callback: (value: {
					url: string;
					canGoBack: boolean;
					canGoForward: boolean;
				}) => void,
			) => void;
			ready: () => void;
			color: () => Promise<PaletteMode>;
			pushUser: (callback: (user: UserInfo) => void) => void;
			pushIssues: (callback: (issues: Issue[]) => void) => void;
			pushUpdatedAt: (callback: (updatedAt: string) => void) => void;
			pushIssueSupplementMap: (
				callback: (map: IssueSupplementMap) => void,
			) => void;
			setColor: (mode: PaletteMode) => void;
			proxyContent: (url: string) => Promise<ArrayBuffer>;
			showFilterMenu: (type: IssueFilterTypes) => void;
			showIssueCardMenu: (issue: Issue) => void;
		};
		setting: {
			display: () => Promise<SettingData>;
			submit: (data: SettingData) => void;
			cancel: () => void;
			color: () => Promise<PaletteMode>;
		};
		about: {
			version: () => Promise<string>;
			color: () => Promise<PaletteMode>;
			close: () => void;
			open: (url: string) => void;
		};
		update: {
			version: () => Promise<UpdateStatus>;
			download: () => void;
			copy: (command: string) => void;
			openRelease: () => void;
			openLink: (url: string) => void;
			close: () => void;
			color: () => Promise<PaletteMode>;
		};
		error: {
			throw: (error: ErrorData) => void;
			show: (callback: (value: ErrorData) => void) => void;
			getPath: () => Promise<string>;
		};
	}
}

export type SettingData = { baseUrl: string; token?: string };
