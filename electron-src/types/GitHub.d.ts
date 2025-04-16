/**
 * GitHubユーザーの最小限の情報を表すインターフェース
 */
export interface GithubUserMinimumInfo {
	id: number;
	node_id: string;
	login: string;
	avatar_url: string;
	html_url: string;
}

/**
 * GitHubユーザーの詳細情報を表すインターフェース
 */
export interface GithubUserInfo extends GithubUserMinimumInfo {
	name: string | null;
	url: string;
	email: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * GitHubのIssueを表すインターフェース
 */
export interface GithubIssue {
	id: number;
	node_id: string;
	url: string;
	title: string;
	html_url: string;
	number: number;
	state: 'open' | 'closed';
	body?: string | null;
	user: GithubUserMinimumInfo | null;
	labels: string[] | GithubLabel[];
	milestone: GithubMilestone | null;
	assignees?: GithubUserMinimumInfo[] | null;
	pull_request?: GithubPullRequest;
	closed_at?: string | null;
	draft?: boolean;
	repository?: GithubRepository;
	comments?: number;
	reactions?: GithubIssueReaction;
	created_at: string;
	updated_at: string;
}

/**
 * GitHubのリポジトリを表すインターフェース
 */
export interface GithubRepository {
	id: number;
	node_id: string;
	full_name: string;
	html_url: string;
}

/**
 * GitHubのラベルを表すインターフェース
 */
export interface GithubLabel {
	id: number;
	node_id: string;
	name: string;
	description: string | null;
	color: string | null;
}

/**
 * GitHubのマイルストーンを表すインターフェース
 */
export interface GithubMilestone {
	id: number;
	node_id: string;
	number: number;
	html_url: string;
	state: 'open' | 'closed';
	title: string;
	description: string | null;
}

/**
 * GitHubのプルリクエストを表すインターフェース
 */
export interface GithubPullRequest {
	merged_at: string | null;
	html_url: string | null;
}

/**
 * GitHubのIssueのリアクションを表すインターフェース
 */
export interface GithubIssueReaction {
	url: string;
	total_count: number;
}

/**
 * GitHubのプルリクエストレビューを表すインターフェース
 */
export interface GithubPrReview {
	id: number;
	node_id: string;
	user: GithubUserMinimumInfo;
	state:
		| 'APPROVED'
		| 'CHANGES_REQUESTED'
		| 'COMMENTED'
		| 'PENDING'
		| 'DISMISSED';
}

/**
 * GitHubの通知を表すインターフェース
 */
export interface GithubNotification {
	id: string;
	repository: GithubRepository;
	subject: {
		title: string;
		type: 'Issue' | 'PullRequest' | 'CheckSuite' | string;
		url: string;
	};
	reason: 'mention' | 'ci_activity' | 'subscribed' | string;
	unread: boolean;
	updated_at: string;
	url: string;
}

type GithubFullIssueData = {
	issue: GithubIssue;
	reviews: GithubPrReview[];
};

/**
 * GitHubのブランチ保護ステータスチェックを表すインターフェース
 */
export interface GithubBranchProtectionStatusCheck {
	url: string;
	enforcement_level: string;
	contexts: string[];
	checks: Array<{
		context: string;
		app_id: number | null;
	}>;
	contexts_url: string;
	strict: boolean;
}

/**
 * GitHubのブランチ保護管理者を表すインターフェース
 */
export interface GithubBranchProtectionAdmin {
	url: string;
	enabled: boolean;
}

/**
 * GitHubのブランチ保護チームを表すインターフェース
 */
export interface GithubBranchProtectionTeam {
	id: number;
	node_id: string;
	url: string;
	html_url: string;
	name: string;
	slug: string;
	description: string | null;
	privacy: string;
	notification_setting: string;
	permission: string;
	members_url: string;
	repositories_url: string;
	parent: {
		id: number;
		node_id: string;
		url: string;
		members_url: string;
		name: string;
		description: string | null;
		permission: string;
		privacy: string;
		notification_setting: string;
		html_url: string;
		repositories_url: string;
		slug: string;
	} | null;
}

/**
 * GitHubのブランチ保護アプリを表すインターフェース
 */
export interface GithubBranchProtectionApp {
	id: number;
	slug: string;
	node_id: string;
	owner: GithubUserMinimumInfo;
	name: string;
	description: string | null;
	external_url: string;
	html_url: string;
	created_at: string;
	updated_at: string;
	permissions: {
		[key: string]: string;
	};
	events: string[];
}

/**
 * GitHubのブランチ保護拒否制限を表すインターフェース
 */
export interface GithubBranchProtectionDismissalRestrictions {
	users: GithubUserMinimumInfo[];
	teams: GithubBranchProtectionTeam[];
	apps: GithubBranchProtectionApp[];
}

/**
 * GitHubのブランチ保護プルリクエストレビューを表すインターフェース
 */
export interface GithubBranchProtectionPullRequestReview {
	url: string;
	dismissal_restrictions?: GithubBranchProtectionDismissalRestrictions;
	dismiss_stale_reviews: boolean;
	require_code_owner_reviews: boolean;
	required_approving_review_count?: number;
	require_last_push_approval?: boolean;
}

/**
 * GitHubのブランチ保護制限を表すインターフェース
 */
export interface GithubBranchProtectionRestrictions {
	url: string;
	users_url: string;
	teams_url: string;
	apps_url: string;
	users: GithubUserMinimumInfo[];
	teams: Array<{
		id: number;
		node_id: string;
		url: string;
		html_url: string;
		name: string;
		slug: string;
		description: string | null;
		privacy: string;
		notification_setting: string;
		permission: string;
		members_url: string;
		repositories_url: string;
		parent: string | null;
	}>;
	apps: Array<{
		id: number;
		slug: string;
		node_id: string;
		owner: GithubUserMinimumInfo;
		name: string;
		description: string;
		external_url: string;
		html_url: string;
		created_at: string;
		updated_at: string;
		permissions: {
			metadata: string;
			contents: string;
			issues: string;
			single_file: string;
		};
		events: string[];
	}>;
}

/**
 * GitHubのブランチ保護を表すインターフェース
 */
export interface GithubBranchProtection {
	url: string;
	enabled: boolean;
	required_status_checks?: GithubBranchProtectionStatusCheck;
	enforce_admins?: GithubBranchProtectionAdmin;
	required_pull_request_reviews?: GithubBranchProtectionPullRequestReview;
	restrictions?: GithubBranchProtectionRestrictions;
	required_linear_history?: {
		enabled: boolean;
	};
	allow_force_pushes?: {
		enabled: boolean;
	};
	allow_deletions?: {
		enabled: boolean;
	};
	block_creations?: {
		enabled: boolean;
	};
	required_conversation_resolution?: {
		enabled: boolean;
	};
	name?: string;
	protected_url?: string;
	required_signatures?: {
		url: string;
		enabled: boolean;
	};
	lock_branch?: {
		enabled: boolean;
	};
	allow_fork_syncing?: {
		enabled: boolean;
	};
}

/**
 * GitHubのブランチを表すインターフェース
 */
export interface GithubBranch {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
	protected: boolean;
	protection?: GithubBranchProtection;
	protected_url?: string;
}
