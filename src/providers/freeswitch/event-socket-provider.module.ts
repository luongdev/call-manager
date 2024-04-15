import { Global, Module } from '@nestjs/common';
import { FreeswitchModule } from '@freeswitch/freeswitch.module';

@Global()
@Module({
  imports:[FreeswitchModule],
})
export class EventSocketProviderModule {

}
