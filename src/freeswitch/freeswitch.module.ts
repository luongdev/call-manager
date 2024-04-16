import { Module } from '@nestjs/common';
import { FreeswitchService } from './freeswitch.service';
import { FreeswitchConfig } from './freeswitch.config';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.type';
import { FreeswitchServer } from './freeswitch.server';

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
    }
  ],
  exports: [FreeswitchService, FreeswitchServer, FreeswitchConfig]
})
export class FreeswitchModule {

}
