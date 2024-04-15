import { registerAs } from '@nestjs/config';

export type FreeswitchConfig = {
    host: string;
    port: number;
    password: string;
}


export default registerAs<FreeswitchConfig>('fs', () => {
  return {
    host: process.env.FS_HOST || 'localhost',
    port: parseInt(process.env.FS_PORT) || 8021,
    password: process.env.FS_PASSWORD || 'ClueCon',
  };
});
