import { net, safeStorage } from 'electron';
import log from 'electron-log/main';
import dayjs from 'dayjs';
import PQueue from 'p-queue';
import {
	translateUserInfo,
	translateIssues,
} from '../tanslators/GithubTranslator';
import { QUEUE_CONCURRENCY, QUEUE_INTERVAL, QUEUE_INTERVAL_CAP } from './queue';
import { store } from './store';
import StoreDataFlag from '../enum/StoreDataFlag';
import type {
	GithubUserInfo,
	GithubIssue,
	GithubPrReview,
	GithubFullIssueData,
	GithubNotification,
} from '../types/GitHub';
import type { UserInfo } from '../../types/User';
import type { Issue } from '../../types/Issue';

const queue = new PQueue({
	concurrency: QUEUE_CONCURRENCY,
	interval: QUEUE_INTERVAL,
	intervalCap: QUEUE_INTERVAL_CAP,
});

export const githubAppSettings: {
	readonly filterTypes: readonly IssueFilterType[];
	readonly perPage: number;
	readonly targetTerm: { value: number; unit: dayjs.ManipulateType };
	readonly retentionTerm: { value: number; unit: dayjs.ManipulateType };
} = {
	filterTypes: ['assigned', 'created', 'mentioned'],
	perPage: 100,
	targetTerm: { value: 1, unit: 'month' },
	retentionTerm: { value: 3, unit: 'month' },
} as const;

export const gainUserInfo = async (): Promise<UserInfo> => {
	const result = await accessGithub({ path: 'user' });
	if (!isUserInfoType(result)) {
		throw new Error('GitHub APIからの認証されたユーザのresponseが異常値です');
	}
	return translateUserInfo(result);
};

export const gainIssues = async (target?: dayjs.Dayjs): Promise<Issue[]> => {
	const since = target?.toISOString() ?? '';
	return Promise.all([
		...githubAppSettings.filterTypes.map((filterType) =>
			gainFilterdIssues(filterType, since),
		),
		gainSubscribedIssues(since),
	])
		.then((values) => {
			return values.flat().reduce((acc: GithubIssue[], cur: GithubIssue) => {
				if (!acc.some((issue) => issue.node_id === cur.node_id)) {
					acc.push(cur);
				}
				return acc;
			}, []);
		})
		.then((issues) =>
			issues.toSorted((a, b) =>
				dayjs(a.updated_at).isBefore(dayjs(b.updated_at)) ? 1 : -1,
			),
		)
		.then((issues) => {
			log.debug('[gainIssues list]', issues);
			return issues;
		})
		.then((issues) => Promise.all(issues.map(addIssueSupplement)))
		.then(translateIssues);
};

export const gainPrReviews = async (repository: string, prNumber: number) => {
	const results = await accessGithub({
		path: `repos/${repository}/pulls/${prNumber}/reviews`,
	});
	if (!isPrReviewsType(results)) {
		throw new Error('GitHub APIからのPRのレビューのresponseが異常値です');
	}
	return results;
};

export const proxyUserIcon = async (userId: number) => {
	const response = await fetch(
		`https://avatars.githubusercontent.com/u/${userId}`,
	);
	log.debug('[proxyUserIcon]', {
		status: response.status,
		url: response.url,
	});
	if (!response.ok) {
		throw new Error(`ユーザーアイコンの取得に失敗しました ${userId}`);
	}
	return await response.arrayBuffer();
};

export const checkStoreData = () => {
	const githubSetting = store.get('githubSetting');
	return githubSetting?.baseUrl && githubSetting?.token
		? StoreDataFlag.VALID
		: StoreDataFlag.INVALID;
};

const gainFilterdIssues = async (
	filterType: IssueFilterType,
	since: string,
): Promise<GithubIssue[]> => {
	const issues = [];
	for (let page = 1; ; page++) {
		const results = await accessGithub({
			path: 'issues',
			query: {
				filter: filterType,
				state: 'all',
				sort: 'updated',
				per_page: String(githubAppSettings.perPage),
				page: String(page),
				since,
			},
		});
		if (!isIssuesType(results)) {
			throw new Error('GitHub APIからのIssueのresponseが異常値です');
		}
		issues.push(...results);
		if (results.length < githubAppSettings.perPage) {
			break;
		}
	}
	return issues;
};

const gainSubscribedIssues = async (since: string): Promise<GithubIssue[]> => {
	const notifications = await gainNotifications(since);

	const issues = await Promise.all(
		notifications
			.filter(
				(n) => n.subject.type === 'Issue' || n.subject.type === 'PullRequest',
			)
			.map((n) => ({
				repository: n.repository,
				url: n.subject.url,
				type: n.subject.type,
			}))
			.map(async (n) => {
				const issue = await accessGithub({ path: n.url });
				return {
					issue,
					repository: n.repository,
					type: n.type,
				};
			}),
	);

	return issues.map((issue) => {
		if (!isIssueType(issue.issue)) {
			throw new Error('GitHub APIからのIssueのresponseが異常値です');
		}
		return {
			...issue.issue,
			repository: issue.repository,
			pull_request:
				issue.type === 'PullRequest'
					? {
							html_url: issue.issue.html_url,
							merged_at:
								'merged_at' in issue.issue &&
								typeof issue.issue.merged_at === 'string'
									? issue.issue.merged_at
									: null,
						}
					: undefined,
		};
	});
};
const gainNotifications = async (
	since: string,
): Promise<GithubNotification[]> => {
	const notifications: GithubNotification[] = [];
	for (let page = 1; ; page++) {
		const results = await accessGithub({
			path: 'notifications',
			query: {
				all: String(true),
				per_page: '50',
				page: String(page),
				since,
			},
		});
		if (!isNotificationsType(results)) {
			throw new Error('GitHub APIからのNotificationのresponseが異常値です');
		}
		notifications.push(...results);
		if (results.length < 50) {
			break;
		}
	}

	return notifications;
};

const addIssueSupplement = async (
	issue: GithubIssue,
): Promise<GithubFullIssueData> => {
	if (issue.pull_request && issue.repository) {
		try {
			const reviews = await gainPrReviews(
				issue.repository.full_name,
				issue.number,
			);
			return { issue, reviews };
		} catch (error) {
			log.info(
				`PR[${issue.repository.full_name}#${issue.number}]のレビューの取得に失敗しました`,
				error,
			);
		}
	}

	return { issue, reviews: [] };
};

const accessGithub = async ({
	path,
	query,
}: {
	path: string;
	query?: Record<string, string>;
}): Promise<unknown> => {
	return new Promise((resolve, reject) => {
		queue.add(async () => {
			try {
				const url = new URL(path, getBaseUrl());
				url.search = new URLSearchParams(query ?? {}).toString();
				log.debug('[accessGithub URL]', url.href);

				const result = await requestToGithub(url);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	});
};
const requestToGithub = async (url: URL) => {
	const response = await net.fetch(url.href, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${getToken()}`,
			'X-GitHub-Api-Version': '2022-11-28',
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}, url: ${url.href}`);
	}

	try {
		return await response.json();
	} catch (error) {
		log.debug('[requestToGithub JSON parse]', {
			url: url.href,
			body: await response.text(),
		});
		throw new Error(
			'GitHub API response is not in JSON format. Please check the API response.',
			{ cause: error },
		);
	}
};

const getBaseUrl = () => {
	const baseUrl = store.get('githubSetting', {
		baseUrl: '',
		token: '',
	}).baseUrl;
	if (!baseUrl) {
		throw new Error('No GitHub baseURL set. Please set one in the settings.');
	}

	return baseUrl;
};

const getToken = () => {
	const token = store.get('githubSetting', { baseUrl: '', token: '' }).token;
	if (!token) {
		throw new Error('No GitHub token set. Please set one in the settings.');
	}

	return safeStorage.decryptString(Buffer.from(token, 'base64'));
};

const isUserInfoType = (target: unknown): target is GithubUserInfo => {
	if (target === null || typeof target !== 'object') {
		return false;
	}
	return (
		'id' in target &&
		'node_id' in target &&
		'login' in target &&
		'avatar_url' in target &&
		'html_url' in target &&
		'url' in target &&
		'created_at' in target &&
		'updated_at' in target
	);
};
const isIssuesType = (target: unknown): target is GithubIssue[] => {
	if (!Array.isArray(target)) {
		return false;
	}

	return target.every((issue) => isIssueType(issue));
};
const isIssueType = (target: unknown): target is GithubIssue => {
	if (target === null || typeof target !== 'object') {
		return false;
	}
	return (
		'id' in target &&
		'node_id' in target &&
		'url' in target &&
		'title' in target &&
		'html_url' in target &&
		'number' in target &&
		'state' in target &&
		'labels' in target &&
		'created_at' in target &&
		'updated_at' in target
	);
};
const isPrReviewsType = (target: unknown): target is GithubPrReview[] => {
	if (!Array.isArray(target)) {
		return false;
	}

	return target.every((review) => isPrReviewType(review));
};
const isPrReviewType = (target: unknown): target is GithubPrReview => {
	if (target === null || typeof target !== 'object') {
		return false;
	}
	return (
		'id' in target &&
		'node_id' in target &&
		'user' in target &&
		'state' in target
	);
};
const isNotificationsType = (
	target: unknown,
): target is GithubNotification[] => {
	if (!Array.isArray(target)) {
		return false;
	}

	return target.every((notification) => isNotificationType(notification));
};
const isNotificationType = (target: unknown): target is GithubNotification => {
	if (target === null || typeof target !== 'object') {
		return false;
	}
	return (
		'id' in target &&
		'repository' in target &&
		'subject' in target &&
		'reason' in target &&
		'unread' in target &&
		'updated_at' in target &&
		'url' in target
	);
};

type IssueFilterType =
	| 'assigned'
	| 'created'
	| 'mentioned'
	| 'subscribed'
	| 'all';
