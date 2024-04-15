import { registerAs } from '@nestjs/config';

export class FreeswitchConfig {
  host: string;
  port: number;
  password: string;
  sendTimeout: number;
}


export default registerAs<FreeswitchConfig>('fs', () => {
  const sendTimeout = parseInt(process.env.FS_SEND_TIMEOUT) || 2000;

  return {
    host: process.env.FS_HOST || 'localhost',
    port: parseInt(process.env.FS_PORT) || 8021,
    password: process.env.FS_PASSWORD || 'ClueCon',
    sendTimeout: sendTimeout < 0 ? 2000 : sendTimeout,
  };
});
