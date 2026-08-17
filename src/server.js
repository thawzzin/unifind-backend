import app from './app.js';
import config from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port} [${config.env}]`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  server.close(() => process.exit(1));
});
