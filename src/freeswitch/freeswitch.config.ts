import { registerAs } from '@nestjs/config';

export class FreeswitchConfig {
  host: string;
  port: number;
  password: string;
  sendTimeout: number;
  serverPort: number;
  serverEnabled: boolean;
  clientEnabled: boolean;
}


export default registerAs<FreeswitchConfig>('freeswitch', () => {
  const sendTimeout = parseInt(process.env.FS_SEND_TIMEOUT) || 2000;

  return {
    host: process.env.FS_HOST || 'localhost',
    port: parseInt(process.env.FS_PORT) || 8021,
    password: process.env.FS_PASSWORD || 'ClueCon',
    sendTimeout: sendTimeout < 0 ? 2000 : sendTimeout,
    serverPort: parseInt(process.env.FS_SERVER_PORT) || 65022,
    clientEnabled: process.env.FS_CLIENT_ENABLED === 'true',
    serverEnabled: process.env.FS_SERVER_ENABLED === 'true',
  };
});
