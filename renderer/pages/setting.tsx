import Head from 'next/head';
import {
	Box,
	Button,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { Heading } from '../components/Heading';

const SettingPage = () => {
	const handleSubmit = () => {
		window.setting?.submit({});
	};
	const handleCancel = () => {
		window.setting?.cancel();
	};

	return (
		<>
			<Head>
				<title>設定</title>
			</Head>
			<Heading level={1} hidden>
				設定
			</Heading>

			<Box component="section">
				<Heading level={2}>設定</Heading>
				<TableContainer>
					<Table>
						<TableBody>
							<TableRow>
								<TableCell>
									<Typography>URL</Typography>
								</TableCell>
								<TableCell>
									<TextField
										value="https://github.com/walk8243"
										variant="standard"
									/>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

			<Box component="section" mt={3}>
				<Heading level={2} hidden>
					操作ボタン
				</Heading>
				<Grid container justifyContent="center" gap={2}>
					<Grid item>
						<Button variant="contained" onClick={handleSubmit}>
							保存
						</Button>
					</Grid>
					<Grid item>
						<Button variant="outlined" onClick={handleCancel}>
							キャンセル
						</Button>
					</Grid>
				</Grid>
			</Box>
		</>
	);
};

export default SettingPage;
