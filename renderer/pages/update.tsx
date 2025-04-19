import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { Heading } from '../components/Heading';
import { ColorModeContext } from '../context/ColorModeContext';
import {
	Alert,
	Box,
	Button,
	Grid,
	IconButton,
	Link,
	Paper,
	Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import codeColor from '../styles/colors/code';
import type { UpdateStatus } from '../../types/Update';

const UpdatePage = () => (
	<Box sx={{ maxHeight: '100vh', overflow: 'hidden' }}>
		<Head>
			<title>Amethyst Update</title>
		</Head>
		<Heading level={1} hidden>
			Amethyst Update
		</Heading>

		<Box component="section" m={2}>
			<Heading level={2} hidden>
				更新情報
			</Heading>

			<UpdateInfo />
			<HowToUpdate />
		</Box>

		<ButtonArea />
	</Box>
);

const UpdateInfo = () => {
	const [status, setStatus] = useState<UpdateStatus | null>(null);
	useEffect(() => {
		window.update?.version().then((version) => {
			setStatus(version);
		});
	}, []);

	return (
		<Box component="section">
			<Heading level={3} hidden>
				更新情報
			</Heading>

			<Grid container m={2} mt={0} rowGap={1}>
				<Grid width="100%">
					{status === null || status.canUpdate ? (
						<Alert severity="warning">
							<Typography>最新バージョンに更新してください</Typography>
						</Alert>
					) : (
						<Alert severity="success">
							<Typography>最新バージョンです</Typography>
						</Alert>
					)}
				</Grid>
				<Grid width="100%">
					{status === null ? (
						<></>
					) : (
						<UpdateInfoContent tag={status.latestRelease} />
					)}
				</Grid>
			</Grid>
		</Box>
	);
};
const UpdateInfoContent = ({ tag }: { tag: string }) => {
	const handleClick = () => {
		window.update?.openRelease();
	};

	return (
		<Alert severity="info">
			<Typography>現在の最新バージョンは {tag} です。</Typography>
			<Typography>
				詳細は
				<Link component="button" onClick={handleClick}>
					Release Notes
				</Link>
				をご覧ください。
			</Typography>
		</Alert>
	);
};

const HowToUpdate = () => {
	return (
		<Box component="section">
			<Heading level={3} hidden>
				更新方法
			</Heading>

			<Box display="grid" rowGap={2}>
				<HowToUpdateForWindows />
				<HowToUpdateForMac />
				<HowToUpdateForOther />
			</Box>
		</Box>
	);
};

const HowToUpdateForWindows = () => {
	const handleClick = () => {
		window.update?.download();
	};

	return (
		<Box component="section">
			<Heading level={4} hidden>
				Windowsの場合の更新方法
			</Heading>

			<Typography variant="subtitle1">Windowsの場合</Typography>
			<Grid
				container
				justifyContent="center"
				mt={1}
				mr={2}
				ml={2}
				mb={2}
				width="auto"
			>
				<Grid width="100%">
					<Typography>
						以下のボタンから最新のMSIファイルをダウンロードしてください。
					</Typography>
				</Grid>
				<Grid mb={1}>
					<Button onClick={handleClick} variant="contained" color="primary">
						最新のMSIファイルをダウンロード
					</Button>
				</Grid>
				<Grid width="100%">
					<Typography>
						ダウンロードが完了したら、エクスプローラーからMSIファイルを実行してください。
					</Typography>
				</Grid>
			</Grid>
		</Box>
	);
};

const HowToUpdateForMac = () => {
	const commands = Object.freeze([
		{ id: 1, value: 'brew update' },
		{ id: 2, value: 'brew upgrade --cask walk8243/cask/amethyst' },
	]);
	const colorMode = useContext(ColorModeContext);
	const handleClick = () => {
		window.update?.copy(commands.map((command) => command.value).join('\n'));
	};

	return (
		<Box component="section">
			<Heading level={4} hidden>
				MacOSの場合の更新方法
			</Heading>

			<Typography variant="subtitle1">MacOSの場合</Typography>
			<Grid
				container
				justifyContent="center"
				mt={1}
				mr={2}
				ml={2}
				mb={2}
				width="auto"
			>
				<Grid width="100%">
					<Typography>
						HomebrewのCaskファイルを読み込みなおして、Amethystをアップデートしてください。
					</Typography>
				</Grid>
				<Grid width="100%">
					<Paper
						elevation={0}
						sx={{
							position: 'relative',
							p: 1,
							color: codeColor[colorMode].on,
							bgcolor: codeColor[colorMode].main,
							borderRadius: 1,
						}}
					>
						<Box component="code">
							{commands.map((command) => (
								<Typography key={command.id}>{command.value}</Typography>
							))}
						</Box>
						<Box
							sx={{ position: 'absolute', top: 0, right: 0, lineHeight: '1em' }}
						>
							<IconButton
								onClick={handleClick}
								sx={{ fontSize: 'inherit', color: codeColor[colorMode].on }}
							>
								<FontAwesomeIcon icon={faClipboard} />
							</IconButton>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

const HowToUpdateForOther = () => {
	const handleClick = () => {
		window.update?.openLink(
			'https://walk8243.github.io/amethyst-electron/detail/developer.html',
		);
	};

	return (
		<Box component="section">
			<Heading level={4} hidden>
				その他の場合の更新方法
			</Heading>

			<Typography variant="subtitle1">その他の場合</Typography>
			<Grid
				container
				justifyContent="center"
				mt={1}
				mr={2}
				ml={2}
				mb={2}
				width="auto"
			>
				<Grid width="100%">
					<Typography>
						以下ドキュメントを参考に、ご自身でビルドしなおしてください。
					</Typography>
				</Grid>
				<Grid>
					<Button
						variant="contained"
						color="primary"
						onClick={handleClick}
						sx={{ textTransform: 'none' }}
					>
						開発者向け | Amethyst
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
};

const ButtonArea = () => {
	const handleClose = () => {
		window.update?.close();
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

export default UpdatePage;
