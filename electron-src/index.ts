import { app } from 'electron';
import isDev from 'electron-is-dev';
import log from 'electron-log/main';
import { main } from './main';

log.initialize({ preload: true });
log.eventLogger.startLogging({});
if (!isDev) {
	log.transports.file.level = 'info';
}

app.on('ready', () => {
	log.info('App is ready');
	main();
});

app.on('window-all-closed', app.quit);
app.on('will-quit', () => {
	log.info('App is quitting');
});
