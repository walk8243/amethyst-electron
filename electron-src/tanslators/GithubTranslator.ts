import type { Issue, IssueLabel, IssueState, Review } from '../../types/Issue';
import type { UserInfo } from '../../types/User';
import type { RecordValue } from '../../types/Utility';
import type {
	GithubUserInfo,
	GithubIssue,
	GithubLabel,
	GithubFullIssueData,
	GithubPrReview,
} from '../types/GitHub';

export const translateUserInfo = (userInfo: GithubUserInfo): UserInfo => ({
	id: userInfo.id,
	login: userInfo.login,
	avatarUrl: userInfo.avatar_url,
	name: userInfo.name,
});

export const translateIssues = (data: GithubFullIssueData[]): Issue[] =>
	data.map(translateIssue);
export const translateIssue = ({
	issue,
	reviews,
}: GithubFullIssueData): Issue => ({
	id: issue.id,
	key: issue.node_id,
	number: issue.number,
	title: issue.title,
	url: issue.html_url,
	repositoryName: issue.repository ? issue.repository.full_name : '',
	state: translateIssueState(issue),
	labels: translateIssueLabels(issue.labels),
	reactions: issue.reactions ? issue.reactions.total_count : 0,
	creator: issue.user
		? {
				login: issue.user.login,
				avatarUrl: issue.user.avatar_url,
			}
		: null,
	reviews: translateIssueReviews(reviews, issue.user?.node_id),
	updatedAt: issue.updated_at,
});

const translateIssueState = (issue: GithubIssue): IssueState => {
	if (issue.pull_request) {
		return {
			type: 'pull-request',
			state: translatePullRequestState(issue),
		};
	}

	return {
		type: 'issue',
		state: issue.state,
	};
};
const translatePullRequestState = (
	issue: GithubIssue,
): RecordValue<Extract<IssueState, { type: 'pull-request' }>, 'state'> => {
	if (issue.pull_request?.merged_at) {
		return 'merged';
	}
	if (issue.state === 'closed') {
		return 'closed';
	}
	if (issue.draft) {
		return 'draft';
	}
	return 'open';
};

const translateIssueLabels = (
	labels: string[] | GithubLabel[],
): IssueLabel[] => {
	return labels.map(translateIssueLabel);
};
const translateIssueLabel = (label: string | GithubLabel): IssueLabel => {
	if (typeof label === 'string') {
		return {
			key: label,
			text: label,
			color: null,
		};
	}

	return {
		key: label.node_id,
		text: label.name,
		color: label.color,
	};
};

const translateIssueReviews = (
	reviews: GithubPrReview[],
	authorId: string = '',
): Review[] => {
	const users = reviews
		.map((review) => review.user.node_id)
		.filter((nodeId) => nodeId !== authorId)
		.reduce<string[]>((acc, cur) => {
			if (!acc.some((val) => val === cur)) {
				acc.push(cur);
			}
			return acc;
		}, []);
	reviews.reverse();

	return users
		.map((user) => reviews.find((review) => review.user.node_id === user)!)
		.map((review) => ({
			login: review.user.login,
			avatarUrl: review.user.avatar_url,
			state: review.state,
		}));
};
