import { useContext } from 'react';
import type { MouseEvent } from 'react';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { ColorModeContext } from '../context/ColorModeContext';
import { IssueContext, IssueDispatchContext } from '../context/IssueContext';
import { safeUnreachable } from '../utils/typescript';
import type {
	Issue,
	IssueLabel,
	IssueState,
	IssueSupplementMapData,
	Review,
} from '../../types/Issue';

import {
	Badge,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	Grid,
	PaletteMode,
	Typography,
} from '@mui/material';
import { alpha, getContrastRatio } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	IconDefinition,
	faCodePullRequest,
} from '@fortawesome/free-solid-svg-icons';
import { faCircleDot } from '@fortawesome/free-regular-svg-icons';
import { githubColor } from '../styles/colors/github';
import surfaceColor from '../styles/colors/surface';
import { GithubAvatar } from './GithubAvatar';

dayjs.extend(RelativeTime);

export const IssueCard = ({
	issue,
	supplement,
}: {
	issue: Issue;
	supplement?: IssueSupplementMapData;
}) => {
	const colorMode = useContext(ColorModeContext);
	const selectedIssue = useContext(IssueContext);
	const dispatch = useContext(IssueDispatchContext);
	const handleClick = (e: MouseEvent) => {
		dispatch(issue);
		window.electron?.issue(issue);
		e.preventDefault();
	};
	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		window.electron.showIssueCardMenu(issue);
	};

	return (
		<Card
			raised={issue.key === selectedIssue?.key}
			sx={{
				width: '100%',
				m: 0.5,
				...(supplement?.isRead
					? {
							color: surfaceColor.variant[colorMode].on,
							bgcolor: surfaceColor.variant[colorMode].main,
						}
					: {
							color: surfaceColor[colorMode].on,
							bgcolor: surfaceColor[colorMode].main,
						}),
			}}
		>
			<CardActionArea onClick={handleClick} onContextMenu={handleContextMenu}>
				<CardContent>
					<Grid container direction="column" rowGap={1}>
						<Grid container columnGap={1}>
							<Grid item pt="2px">
								<FontAwesomeIcon
									icon={findIssueIcon(issue.state)}
									color={findIssueStateColor(issue.state)}
								/>
							</Grid>
							<Grid item xs zeroMinWidth>
								<Typography
									variant="subtitle1"
									color="inherit"
									sx={{ overflowWrap: 'break-word' }}
								>
									{issue.title}
								</Typography>
							</Grid>
						</Grid>
						<Grid container columnGap={2}>
							<Grid item>
								<GithubAvatar user={issue.creator!} size={20} />
							</Grid>
							<Grid
								container
								item
								xs
								zeroMinWidth
								direction="row-reverse"
								columnGap={1}
							>
								{issue.reviews.map((review) => (
									<Grid item key={review.login}>
										<ReviewerAvatar review={review} />
									</Grid>
								))}
							</Grid>
						</Grid>
						<Grid container columnGap={1}>
							{issue.labels.map((label) => (
								<Grid item key={label.key}>
									<IssueLabel label={label} mode={colorMode} />
								</Grid>
							))}
						</Grid>
						<Grid container columnGap={1}>
							<Grid container item xs zeroMinWidth>
								<Typography variant="body2">{issue.repositoryName}</Typography>
								<Typography
									variant="body2"
									sx={{ ml: 1, '::before': { content: '"#"' } }}
								>
									{issue.number}
								</Typography>
							</Grid>
							<Grid item>
								<Typography variant="body2">
									{dayjs(issue.updatedAt).fromNow()}
								</Typography>
							</Grid>
						</Grid>
					</Grid>
				</CardContent>
			</CardActionArea>
		</Card>
	);
};

const ReviewerAvatar = ({ review }: { review: Review }) => {
	return (
		<Badge
			color={findIssueReviewStateIcon(review.state)}
			overlap="circular"
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			variant="dot"
		>
			<GithubAvatar user={review} size={20} />
		</Badge>
	);
};
const IssueLabel = ({
	label,
	mode,
}: {
	label: IssueLabel;
	mode: PaletteMode;
}) => {
	const color = label.color ? `#${label.color}` : '#000';
	const bgColor = alpha(color, mode === 'dark' ? 0.9 : 0.67);
	const textColor =
		getContrastRatio(color, surfaceColor[mode].main) > 4.5
			? surfaceColor[mode].main
			: surfaceColor[mode].on;

	return (
		<Chip
			label={label.text}
			size="small"
			sx={{
				color: textColor,
				backgroundColor: bgColor,
				border: `1px solid ${color}`,
			}}
		/>
	);
};

const findIssueIcon = (state: IssueState): IconDefinition => {
	switch (state.type) {
		case 'issue':
			return faCircleDot;
		case 'pull-request':
			return faCodePullRequest;
	}

	safeUnreachable('IssueState.type', state);
};
const findIssueStateColor = (state: IssueState) => {
	switch (state.state) {
		case 'open':
			return githubColor.open;
		case 'closed':
			switch (state.type) {
				case 'issue':
					return githubColor.merged;
				case 'pull-request':
					return githubColor.closed;
			}
			break;
		case 'merged':
			return githubColor.merged;
		case 'draft':
			return githubColor.draft;
	}

	safeUnreachable('IssueState.state', state);
};
const findIssueReviewStateIcon = (state: Review['state']) => {
	switch (state) {
		case 'APPROVED':
			return 'success';
		case 'CHANGES_REQUESTED':
			return 'error';
		case 'COMMENTED':
			return 'ordinarily';
		case 'PENDING':
		case 'DISMISSED':
			return 'default';
	}

	safeUnreachable('Review.state', state);
};
