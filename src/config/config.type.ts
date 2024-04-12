import { AppConfig } from '@config/app.config';
import { DatabaseConfig } from '@database/database.config';


export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
}
