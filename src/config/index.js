import 'dotenv/config';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

config.isProduction = config.env === 'production';

export default config;
