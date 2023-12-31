import type { UserInfo } from '../../types/User';
import type { Issue, IssueSupplementMap } from '../../types/Issue';
import type { UpdateStatus } from '../../types/Update';

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
			pushUser: (callback: (user: UserInfo) => void) => void;
			pushIssues: (callback: (issues: Issue[]) => void) => void;
			pushUpdatedAt: (callback: (updatedAt: string) => void) => void;
			pushIssueSupplementMap: (
				callback: (map: IssueSupplementMap) => void,
			) => void;
		};
		setting: {
			display: () => Promise<SettingData>;
			submit: (data: SettingData) => void;
			cancel: () => void;
		};
		about: {
			version: () => Promise<string>;
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
		};
	}
}

export type SettingData = { baseUrl: string; token?: string };
