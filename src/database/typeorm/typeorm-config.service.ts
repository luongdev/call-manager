import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.type';
import { DatabaseConfigService } from '@database/database-config.service';
import { TypeormOptions } from '@database/typeorm/typeorm.options';

@Injectable()
export class TypeormConfigService implements DatabaseConfigService<TypeormOptions> {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  createOptions(): TypeormOptions {
    return new TypeormOptions(this.configService);
  }
}
