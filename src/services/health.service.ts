import config from '../config/index.js';

export function getStatus() {
  return {
    status: 'ok',
    env: config.env,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}
