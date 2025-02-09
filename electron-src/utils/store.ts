import { app } from 'electron';
import Store from 'electron-store';

export const store = new Store<{
	appVersion: string;
	githubSetting: { url: string };
	colorMode: 'light' | 'dark';
}>({
	schema: {
		appVersion: {
			type: 'string',
		},
		githubSetting: {
			type: 'object',
			properties: {
				url: {
					type: 'string',
				},
			},
		},
		colorMode: {
			type: 'string',
			enum: ['light', 'dark'],
			default: 'light',
		},
	},
});

store.set('appVersion', app.getVersion());
