import { app } from 'electron';
import Store from 'electron-store';
import semver from 'semver';
import type { UserInfo } from '../../types/User';
import type { Issue, IssueSupplementMap } from '../../types/Issue';

interface StoreSchema {
	appVersion: string;
	githubSetting: { baseUrl: string; token: string };
	userInfo: UserInfo;
	issueData: {
		updatedAt: string;
		issues: Issue[];
	};
	issueSupplementMap: IssueSupplementMap;
	colorMode: 'light' | 'dark';
}

export const store = new Store<StoreSchema>({
	schema: {
		appVersion: {
			type: 'string',
		},
		githubSetting: {
			type: 'object',
			properties: {
				baseUrl: {
					type: 'string',
				},
				token: {
					type: 'string',
				},
			},
		},
		userInfo: {
			type: 'object',
			properties: {
				login: {
					type: 'string',
				},
				name: {
					type: 'string',
				},
				avatarUrl: {
					type: 'string',
				},
			},
		},
		issueData: {
			type: 'object',
			properties: {
				updatedAt: {
					type: 'string',
					default: '',
				},
				issues: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: {
								type: 'number',
							},
							key: {
								type: 'string',
							},
							title: {
								type: 'string',
							},
							url: {
								type: 'string',
							},
							repositoryName: {
								type: 'string',
							},
							state: {
								type: 'object',
								properties: {
									type: {
										type: 'string',
									},
									state: {
										type: 'string',
									},
								},
							},
							labels: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										key: {
											type: 'string',
										},
										text: {
											type: 'string',
										},
										color: {
											type: 'string',
										},
									},
								},
							},
							reactions: {
								type: 'number',
							},
							creator: {
								type: 'object',
								properties: {
									login: {
										type: 'string',
									},
									avatarUrl: {
										type: 'string',
									},
								},
							},
							reviews: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										login: {
											type: 'string',
										},
										avatarUrl: {
											type: 'string',
										},
										state: {
											type: 'string',
										},
									},
								},
							},
							updated_at: {
								type: 'string',
							},
						},
					},
					default: [],
				},
			},
		},
		issueSupplementMap: {
			type: 'object',
			patternProperties: {
				'^(I|PR)_': {
					type: 'object',
					properties: {
						isRead: {
							type: 'boolean',
							default: false,
						},
					},
				},
			},
		},
		colorMode: {
			type: 'string',
			enum: ['light', 'dark'],
			default: 'light',
		},
	},
});

if (
	semver.major(app.getVersion()) >
	semver.major(store.get('appVersion', '0.0.0'))
) {
	store.delete('userInfo');
}
store.set('appVersion', app.getVersion());

export const removeIssue = (issue: Issue) => {
	const { issues } = store.get('issueData');
	issues.splice(
		issues.findIndex((i) => i.key === issue.key),
		1,
	);
	store.set('issueData.issues', issues);
};
