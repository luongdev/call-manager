import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@config/app.config';
import databaseConfig from '@database/database.config';
import freeswitchConfig from '@freeswitch/freeswitch.config';
import { LoggerProviderModule } from './providers/logger/logger-provider.module';
import { FreeswitchModule } from './freeswitch/freeswitch.module';
import { WsModule } from './websocket/ws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, freeswitchConfig]
    }),
    WsModule,
    // DatabaseProviderModule,
    FreeswitchModule,
    LoggerProviderModule,
  ],
  providers: [AppService],
})
export class AppModule {
}
