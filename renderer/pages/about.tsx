import { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { Box, Button, Grid, Link, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Heading } from '../components/Heading';
import appIcon from '../../docs/img/icon.png';

const AboutPage = () => (
	<Box sx={{ overflow: 'hidden', mt: -3 }}>
		<Head>
			<title>このアプリについて</title>
		</Head>
		<Heading level={1} hidden>
			Amethyst
		</Heading>

		<AppInfo />
		<ButtonArea />
		<CopyRight />
	</Box>
);

const AppInfo = () => {
	const [version, setVersion] = useState('');
	const handleOpenSource = (url: string) => {
		window.about?.open(url);
	};

	useEffect(() => {
		window.about?.version().then((v) => setVersion(v));
	}, []);

	return (
		<Box component="section" my={3}>
			<Heading level={2} hidden>
				アプリケーションの情報
			</Heading>

			<Grid container alignItems="center" gap={2} sx={{ px: 1 }}>
				<Grid>
					<Image
						alt="app icon"
						src={appIcon}
						width={100}
						height={100}
						style={{ marginLeft: 'auto', marginRight: 'auto' }}
						placeholder="blur"
					/>
				</Grid>
				<Grid container direction="column" size="grow" gap={2}>
					<Grid container alignItems="flex-end" gap={1}>
						<Grid>
							<Typography variant="h3">Amethyst</Typography>
						</Grid>
						<Grid>
							<Typography variant="subtitle1">{version}</Typography>
						</Grid>
					</Grid>
					<Grid>
						<Typography>
							関係しているGitHubのIssuesを表示・管理するデスクトップアプリ
						</Typography>
					</Grid>
					<Grid>
						<Link
							component="button"
							onClick={() =>
								handleOpenSource(
									'https://github.com/walk8243/amethyst-electron',
								)
							}
						>
							<FontAwesomeIcon icon={faGithub} style={{ marginRight: 8 }} />
							walk8243/amethyst-electron
						</Link>
					</Grid>
				</Grid>
			</Grid>
		</Box>
	);
};

const ButtonArea = () => {
	const handleClose = () => {
		window.about?.close();
	};

	return (
		<Box component="section" my={3}>
			<Heading level={2} hidden>
				ボタン配置領域
			</Heading>

			<Grid container justifyContent="center">
				<Grid>
					<Button variant="outlined" onClick={handleClose}>
						閉じる
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
};

const CopyRight = () => (
	<Box component="section" mt={3}>
		<Heading level={2} hidden>
			著作権情報
		</Heading>

		<Grid container justifyContent="center">
			<Grid>
				<Typography
					variant="caption"
					sx={{ '::before': { content: '"©"', mr: 0.5 } }}
				>
					walk8243
				</Typography>
			</Grid>
		</Grid>
	</Box>
);

export default AboutPage;
