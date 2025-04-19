import {
	ReactNode,
	Reducer,
	useContext,
	useEffect,
	useReducer,
	useState,
} from 'react';
import Head from 'next/head';
import type { UserInfo } from '../../types/User';

import { Box, Grid } from '@mui/material';
import { ColorModeContext } from '../context/ColorModeContext';
import {
	IssueListContext,
	IssueContext,
	IssueDispatchContext,
} from '../context/IssueContext';
import {
	IssueFilterContext,
	IssueFilterDispatchContext,
	issueFilterAll,
	IssueFilter,
} from '../context/IssueFilterContext';
import { IssueSupplementMapContext } from '../context/IssueSupplementMapContext';
import { UserInfoContext } from '../context/UserContext';
import ErrorFallback from '../components/ErrorFallback';
import { Heading } from '../components/Heading';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import IssueList from '../components/IssueList';
import Viewer from '../components/Viewer';
import { background } from '../styles/colors/common';
import text from '../styles/colors/text';
import type { Issue, IssueSupplementMap } from '../../types/Issue';

const IndexPage = () => {
	useEffect(() => {
		window.electron?.ready();
	}, []);

	return (
		<>
			<Head>
				<title>Amethyst</title>
			</Head>
			<Heading level={1} hidden>
				Amethyst
			</Heading>

			<IssueFilterContextProvider>
				<UserInfoContextProvider>
					<IssueContextProvider>
						<IssueSupplementMapContextProvider>
							<ErrorFallback>
								<MainComponent />
							</ErrorFallback>
						</IssueSupplementMapContextProvider>
					</IssueContextProvider>
				</UserInfoContextProvider>
			</IssueFilterContextProvider>
		</>
	);
};

const MainComponent = () => {
	const colorMode = useContext(ColorModeContext);

	return (
		<Box
			height="100vh"
			color={text[colorMode]}
			bgcolor={background[colorMode].main}
		>
			<Header />
			<Box component="main" height="100%">
				<Heading level={2} hidden>
					メイン
				</Heading>
				<Grid
					container
					display="grid"
					gridTemplateColumns="250px 350px 1fr"
					height="100%"
					overflow="hidden"
				>
					<Grid sx={{ width: 250 }}>
						<Menu />
					</Grid>
					<Grid sx={{ width: 350, height: '100%', overflowY: 'hidden' }}>
						<IssueList />
					</Grid>
					<Grid>
						<Viewer />
					</Grid>
				</Grid>
			</Box>
			<Footer />
		</Box>
	);
};

const UserInfoContextProvider = ({ children }: { children: ReactNode }) => {
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	useEffect(() => {
		window.electron?.pushUser((user) => setUserInfo(() => user));
	}, []);

	return (
		<UserInfoContext.Provider value={userInfo}>
			{children}
		</UserInfoContext.Provider>
	);
};

const IssueFilterContextProvider = ({ children }: { children: ReactNode }) => {
	const [issueFilter, dispatch] = useReducer<IssueFilter, [IssueFilter]>(
		(_prev, current) => current,
		issueFilterAll,
	);

	return (
		<IssueFilterContext.Provider value={issueFilter}>
			<IssueFilterDispatchContext.Provider value={dispatch}>
				{children}
			</IssueFilterDispatchContext.Provider>
		</IssueFilterContext.Provider>
	);
};

const IssueContextProvider = ({ children }: { children: ReactNode }) => {
	const [issues, setIssues] = useState<Issue[] | null>(null);
	const [issue, dispatch] = useReducer<Issue | null, [Issue]>(
		(_prev, current) => current,
		null,
	);

	useEffect(() => {
		window.electron?.pushIssues((issues) => setIssues(issues));
	}, []);

	return (
		<IssueListContext.Provider value={issues}>
			<IssueContext.Provider value={issue}>
				<IssueDispatchContext.Provider value={dispatch}>
					{children}
				</IssueDispatchContext.Provider>
			</IssueContext.Provider>
		</IssueListContext.Provider>
	);
};

const IssueSupplementMapContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [issueSupplementMap, setIssueSupplementMap] =
		useState<IssueSupplementMap>({});
	useEffect(() => {
		window.electron?.pushIssueSupplementMap((map) => {
			setIssueSupplementMap(map);
		});
	}, []);

	return (
		<IssueSupplementMapContext.Provider value={issueSupplementMap}>
			{children}
		</IssueSupplementMapContext.Provider>
	);
};

export default IndexPage;
