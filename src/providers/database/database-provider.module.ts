import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeormConfigService } from '@database/typeorm/typeorm-config.service';
import { DatabaseModule } from '@database/database.module';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [TypeormConfigService],
      useFactory: (dbConfigService: TypeormConfigService) => {
        return dbConfigService.createOptions().get();
      },
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      }
    })
  ],
  exports: [],
})
export class DatabaseProviderModule {
}
