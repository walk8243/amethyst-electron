import { useContext } from 'react';
import Head from 'next/head';

import {
	Box,
	List,
	ListItem,
	ListItemProps,
	Typography,
	styled,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodePullRequest, faInbox } from '@fortawesome/free-solid-svg-icons';
import { faCircleDot } from '@fortawesome/free-regular-svg-icons';

import { Heading } from '../components/Heading';
import { ColorModeContext } from '../context/ColorModeContext';
import { container } from '../styles/colors/surface';
import text from '../styles/colors/text';

const MenuPage = () => {
	const colorMode = useContext(ColorModeContext);
	const handleIssues = () => {
		window.menu.issues();
	};
	const handlePullRequests = () => {
		window.menu.pullRequests();
	};
	const handleNotifications = () => {
		window.menu.notifications();
	};

	return (
		<>
			<Head>
				<title>Amethyst Menu</title>
			</Head>
			<Heading level={1} hidden>
				Amethyst Menu
			</Heading>

			<Box
				component="main"
				height="100vh"
				color={text[colorMode]}
				bgcolor={container[colorMode].main}
			>
				<Heading level={2} hidden>
					メニュー
				</Heading>
				<List>
					<MenuListItem onClick={handleIssues}>
						<FontAwesomeIcon icon={faCircleDot}></FontAwesomeIcon>
						<Typography>Issues</Typography>
					</MenuListItem>
					<MenuListItem onClick={handlePullRequests}>
						<FontAwesomeIcon icon={faCodePullRequest}></FontAwesomeIcon>
						<Typography>Pull Requests</Typography>
					</MenuListItem>
					<MenuListItem onClick={handleNotifications}>
						<FontAwesomeIcon icon={faInbox}></FontAwesomeIcon>
						<Typography>Notifications</Typography>
					</MenuListItem>
				</List>
			</Box>
		</>
	);
};

const MenuListItem = styled(ListItem)<ListItemProps>(() => ({
	marginBottom: '4px',
	cursor: 'pointer',
	'& .MuiTypography-body1': {
		fontSize: '20px',
	},
	'&>svg': {
		marginRight: '4px',
	},
	'&:hover': {
		backgroundColor: container['light'].highest,
	},
}));

export default MenuPage;
