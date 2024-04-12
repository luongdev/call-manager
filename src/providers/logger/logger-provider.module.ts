import { Global, Module } from '@nestjs/common';
import { LoggerModule } from '@logger/logger.module';

import { config , transports, } from 'winston';
import appConfigFn, { AppConfig } from '@config/app.config';
import { LoggerService } from '@logger/logger.service';
import { LoggerFactory } from './logger.factory';
import logFormat from './logger.format';

const appConfig = appConfigFn() as AppConfig;

@Global()
@Module({
  imports: [
    LoggerModule.registerAsync({
      imports: [],
      exitOnError: false,
      level: appConfig.logLevel,
      levels: config.syslog.levels,
      format:logFormat,
      transports: [new transports.Console()],
    }),
  ],
  providers: [
    LoggerFactory, {
      provide: LoggerService,
      useFactory: (loggerFactory: LoggerFactory) => {
        return loggerFactory.createLogger('main');
      },
      inject: [LoggerFactory],
    }
  ],
  exports: [LoggerFactory, LoggerService],
})
export class LoggerProviderModule {

}
