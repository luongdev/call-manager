import { AppConfig } from '@config/app.config';
import { DatabaseConfig } from '@database/database.config';
import { FreeswitchConfig } from '@freeswitch/freeswitch.config';


export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  freeswitch: FreeswitchConfig;
}
