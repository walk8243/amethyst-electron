import type { UserInfo } from './User';

export interface Issue {
	id: number;
	key: string;
	number: number;
	title: string;
	url: string;
	repositoryName: string;
	state: IssueState;
	labels: IssueLabel[];
	reactions: number;
	creator: UserInfo | null;
	reviews: Review[];
	updatedAt: string;
}

export type IssueSupplementMap = {
	[key in Issue['key']]: IssueSupplementMapData;
};

export type IssueState =
	| { type: 'issue'; state: 'open' | 'closed' }
	| { type: 'pull-request'; state: 'open' | 'draft' | 'merged' | 'closed' };

export interface IssueLabel {
	key: string;
	text: string;
	color: string | null;
}

export interface Review extends UserInfo {
	state:
		| 'APPROVED'
		| 'CHANGES_REQUESTED'
		| 'COMMENTED'
		| 'PENDING'
		| 'DISMISSED';
}

export interface IssueSupplementMapData {
	isRead: boolean;
}
