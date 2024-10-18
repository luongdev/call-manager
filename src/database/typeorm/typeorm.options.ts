import { DatabaseOptions } from '@database/database.options';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.type';

export class TypeormOptions implements DatabaseOptions {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  get(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('database.type', { infer: true }),
      url: this.configService.get('database.url', { infer: true }),
      host: this.configService.get('database.host', { infer: true }),
      port: this.configService.get('database.port', { infer: true }),
      username: this.configService.get('database.username', { infer: true }),
      password: this.configService.get('database.password', { infer: true }) as string,
      database: this.configService.get('database.name', { infer: true }),
      synchronize: this.configService.get('database.synchronize', { infer: true, }),
      dropSchema: false,
      keepConnectionAlive: true,
      logging: this.configService.get('app.nodeEnv', { infer: true }) !== 'production',
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      extra: {
        max: this.configService.get('database.maxConnections', { infer: true }),
        ssl: this.configService.get('database.sslEnabled', { infer: true })
          ? { rejectUnauthorized: this.configService.get( 'database.rejectUnauthorized',  { infer: true }),
            ca: this.configService.get('database.ca', { infer: true }) ?? undefined,
            key: this.configService.get('database.key', { infer: true }) ??  undefined,
            cert: this.configService.get('database.cert', { infer: true }) ??  undefined,
          }
          : undefined,
      }
    } as TypeOrmModuleOptions;
  }
}
