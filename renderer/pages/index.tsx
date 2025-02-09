import { useContext } from 'react';
import Head from 'next/head';

import { Box, Typography } from '@mui/material';
import { ColorModeContext } from '../context/ColorModeContext';

import { Heading } from '../components/Heading';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { background } from '../styles/colors/common';
import text from '../styles/colors/text';

const IndexPage = () => {
	return (
		<>
			<Head>
				<title>Amethyst</title>
			</Head>
			<Heading level={1} hidden>
				Amethyst
			</Heading>

			<MainComponent />
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
				<Box>
					<Typography>コンテンツ</Typography>
				</Box>
			</Box>
			<Footer />
		</Box>
	);
};

export default IndexPage;
