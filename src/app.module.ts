import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@config/app.config';
import databaseConfig from '@database/database.config';
import { DatabaseProviderModule } from '@providers/database/database-provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    DatabaseProviderModule
  ],
  providers: [AppService],
})
export class AppModule {
}
