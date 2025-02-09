import type { PaletteMode } from '@mui/material';

declare global {
	interface Window {
		setting: {
			display: () => Promise<unknown>;
			submit: (data: unknown) => void;
			cancel: () => void;
			color: () => Promise<PaletteMode>;
		};
		about: {
			version: () => Promise<string>;
			color: () => Promise<PaletteMode>;
			close: () => void;
			open: (url: string) => void;
		};
	}
}
