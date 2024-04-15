import { Module } from '@nestjs/common';
import { FreeswitchService } from './freeswitch.service';

@Module({
  providers: [FreeswitchService],
  exports: [FreeswitchService],
})
export class FreeswitchModule {

}
