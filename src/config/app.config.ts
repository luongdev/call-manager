import { registerAs } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';

export class AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  logLevel: LogLevel;
}

export default registerAs<AppConfig>('app', () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel,
  };
});
