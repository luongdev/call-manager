import { DynamicModule, Global, Module } from '@nestjs/common';
import { LOGGER_MODULES_OPTIONS_ASYNC, LoggerModuleOptionsAsync } from './logger-module.options';

@Global()
@Module({})
export class LoggerModule {
  static registerAsync(loggerOptions: LoggerModuleOptionsAsync): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_MODULES_OPTIONS_ASYNC,
          useValue: loggerOptions,
        },
      ],
      exports: [LOGGER_MODULES_OPTIONS_ASYNC],
      global: true,
    };
  }
}
