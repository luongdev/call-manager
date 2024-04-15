import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@config/app.config';
import databaseConfig from '@database/database.config';
import freeswitchConfig from '@freeswitch/freeswitch.config';
import { DatabaseProviderModule } from '@providers/database/database-provider.module';
import { LoggerProviderModule } from './providers/logger/logger-provider.module';
import { TestModule } from './modules/test/test.module';
import { EventSocketProviderModule } from './providers/freeswitch/event-socket-provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, freeswitchConfig],
      envFilePath: ['.env'],
    }),
    LoggerProviderModule,
    DatabaseProviderModule,
    EventSocketProviderModule,
    TestModule
  ],
  providers: [AppService],
})
export class AppModule {
}
