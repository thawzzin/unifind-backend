import 'dotenv/config';

interface AppConfig {
  env: string;
  port: number;
  corsOrigin: string;
  isProduction: boolean;
}

const env = process.env.NODE_ENV ?? 'development';

const config: AppConfig = {
  env,
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  isProduction: env === 'production',
};

export default config;
