import { Module } from '@nestjs/common';
import { FreeswitchService } from './freeswitch.service';
import { FreeswitchConfig } from './freeswitch.config';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Module({
  providers: [
    FreeswitchService,
    {
      provide: FreeswitchConfig,
      useFactory: (allConfig: ConfigService<AllConfigType>) => {
        return allConfig.get<FreeswitchConfig>('fs', { infer: true });
      },
      inject: [ConfigService<AllConfigType>]
    }
  ],
  exports: [FreeswitchService, FreeswitchConfig],
})
export class FreeswitchModule {

}
