import { useMemo, useReducer } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import type { PaletteMode } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ErrorBoundary from '../components/ErrorBoundary';
import {
	ColorModeContext,
	ColorModeDispatchContext,
	colorSetting,
} from '../context/ColorModeContext';

import 'modern-css-reset';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import textColor from '../styles/colors/text';

const MyApp = ({ Component, pageProps }: AppProps) => {
	const [mode, dispatch] = useReducer<PaletteMode, [PaletteMode]>(
		(_prev, cur) => cur,
		'light',
	);
	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					...colorSetting,
					mode,
				},
				spacing: 5,
				typography: {
					fontSize: 14,
					h3: {
						fontSize: '32px',
					},
					h4: {
						fontSize: '28px',
					},
					h5: {
						fontSize: '24px',
					},
					h6: {
						fontSize: '22px',
					},
					subtitle1: {
						color: textColor.level[mode].weak,
						fontSize: '16px',
					},
					subtitle2: {
						color: textColor.level[mode].weak,
						fontSize: '14px',
					},
					body1: {
						fontSize: '14px',
					},
					body2: {
						fontSize: '12px',
					},
				},
				components: {
					MuiCardContent: {
						styleOverrides: {
							root: {
								padding: '10px',
							},
						},
					},
				},
			}),
		[mode],
	);

	return (
		<>
			<Head>
				<title>Amethyst</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<ColorModeContext.Provider value={mode}>
				<ColorModeDispatchContext.Provider value={dispatch}>
					<ThemeProvider theme={theme}>
						<ErrorBoundary>
							<Component {...pageProps} />
						</ErrorBoundary>
					</ThemeProvider>
				</ColorModeDispatchContext.Provider>
			</ColorModeContext.Provider>
		</>
	);
};

export default MyApp;
