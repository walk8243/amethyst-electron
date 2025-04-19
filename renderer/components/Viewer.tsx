import { useContext, useEffect, useState } from 'react';
import { ColorModeContext } from '../context/ColorModeContext';

import {
	Box,
	Grid,
	IconButton,
	InputAdornment,
	Paper,
	TextField,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faAngleDown,
	faAngleUp,
	faArrowLeft,
	faArrowRight,
	faArrowRotateRight,
	faArrowUpRightFromSquare,
	faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { Heading } from './Heading';
import { UrlBar } from './UrlBar';
import surface from '../styles/colors/surface';

const Viewer = () => {
	const colorMode = useContext(ColorModeContext);

	return (
		<Box component="section" height="100%" bgcolor={surface[colorMode].main}>
			<Heading level={3} hidden>
				Issue
			</Heading>
			<Grid
				container
				display="grid"
				gridTemplateRows="max-content 1fr"
				height="100%"
			>
				<IssueUrlBar />
				<Paper></Paper>
			</Grid>
		</Box>
	);
};

const IssueUrlBar = () => {
	const [url, setUrl] = useState<string | null>(null);
	const [canGo, setCanGo] = useState<{ back: boolean; forward: boolean }>({
		back: false,
		forward: false,
	});
	const [search, setSearch] = useState<string>('');

	const handleHistory = async (direction: 'back' | 'forward') => {
		const result = (await window.electron?.history(direction)) ?? {
			canGoBack: false,
			canGoForward: false,
		};
		setCanGo({ back: result.canGoBack, forward: result.canGoForward });
	};
	const handleReload = () => {
		window.electron?.reload();
	};
	const handleSearch = async (direction: 'next' | 'back') => {
		await window.electron?.search(search, direction);
	};
	const handleOpen = () => {
		if (!url) return;
		window.electron?.open(url);
	};

	useEffect(() => {
		window.electron?.load(({ url, canGoBack, canGoForward }) => {
			setUrl(url);
			setCanGo({ back: canGoBack, forward: canGoForward });
		});
	}, []);

	return (
		<Box component="section">
			<Heading level={4} hidden>
				Issue URLバー
			</Heading>
			<Grid
				container
				display="grid"
				gridTemplateColumns="auto auto auto minmax(300px, 1fr) auto auto"
				columnGap={2}
				p={2}
			>
				<Grid>
					<IconButton
						onClick={() => handleHistory('back')}
						size="small"
						disabled={!canGo.back}
					>
						<FontAwesomeIcon icon={faArrowLeft} />
					</IconButton>
				</Grid>
				<Grid>
					<IconButton
						onClick={() => handleHistory('forward')}
						size="small"
						disabled={!canGo.forward}
					>
						<FontAwesomeIcon icon={faArrowRight} />
					</IconButton>
				</Grid>
				<Grid>
					<IconButton onClick={handleReload} size="small">
						<FontAwesomeIcon icon={faArrowRotateRight} />
					</IconButton>
				</Grid>
				<Grid>
					<UrlBar url={url} />
				</Grid>
				<Grid>
					<TextField
						hiddenLabel
						variant="outlined"
						size="small"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FontAwesomeIcon icon={faMagnifyingGlass} />
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => handleSearch('back')} size="small">
										<FontAwesomeIcon icon={faAngleUp} />
									</IconButton>
									<IconButton onClick={() => handleSearch('next')} size="small">
										<FontAwesomeIcon icon={faAngleDown} />
									</IconButton>
								</InputAdornment>
							),
						}}
						inputProps={{
							style: {
								paddingLeft: 0,
								paddingTop: '4px',
								paddingBottom: '4px',
								paddingRight: 0,
							},
						}}
						onChange={(event) => setSearch(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') handleSearch('next');
						}}
						value={search}
					/>
				</Grid>
				<Grid>
					<IconButton onClick={handleOpen} size="small">
						<FontAwesomeIcon icon={faArrowUpRightFromSquare} />
					</IconButton>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Viewer;
