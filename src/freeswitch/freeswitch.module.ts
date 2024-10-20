import { Module } from '@nestjs/common';
import { FreeswitchService } from './freeswitch.service';
import { FreeswitchConfig } from './freeswitch.config';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.type';
import { FreeswitchServer } from './freeswitch.server';
import { AppConfig } from '@config/app.config';
import { DatabaseProviderModule } from '@providers/database/database-provider.module';
import { Channel } from './entity/channel.entity';
import { ChannelController } from './controller/channel.controller';
import { SocketStore } from './freeswitch.type';
import { ChannelSocketStore } from './store/channel-socket-store';

@Module({
  providers: [
    FreeswitchService,
    FreeswitchServer,
    {
      provide: FreeswitchConfig,
      useFactory: (allConfig: ConfigService<AllConfigType>) => {
        return allConfig.get<FreeswitchConfig>('freeswitch', { infer: true });
      },
      inject: [ConfigService<AllConfigType>]
    },
    {
      provide: AppConfig,
      useFactory: (allConfig: ConfigService<AllConfigType>) => {
        return allConfig.get<FreeswitchConfig>('app', { infer: true });
      },
      inject: [ConfigService<AllConfigType>]
    },
    { provide: SocketStore, useValue: new ChannelSocketStore() },
  ],
  imports: [DatabaseProviderModule, DatabaseProviderModule.forFeature(Channel)],
  exports: [FreeswitchService, FreeswitchServer, FreeswitchConfig, SocketStore],
  controllers: [ChannelController],
})
export class FreeswitchModule {

}
