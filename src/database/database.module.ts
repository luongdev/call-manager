import { Module } from '@nestjs/common';
import { TypeormConfigService } from '@database/typeorm/typeorm-config.service';

@Module({
  providers: [TypeormConfigService],
  exports: [TypeormConfigService],
})
export class DatabaseModule {

}
