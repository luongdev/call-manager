import { Inject, Injectable, Type } from '@nestjs/common';
import { createLogger } from 'winston';
import { LoggerService } from '@logger/logger.service';
import { LOGGER_MODULES_OPTIONS_ASYNC, LoggerModuleOptionsAsync } from '@logger/logger-module.options';

@Injectable()
export class LoggerFactory {
  private readonly options: LoggerModuleOptionsAsync;

  constructor(@Inject(LOGGER_MODULES_OPTIONS_ASYNC) options: LoggerModuleOptionsAsync) {
    this.options = options;
  }

  createLogger(marker: Type | string = 'main'): LoggerService {
    const logger = createLogger(this.options);

    return new LoggerService(logger, marker);
  }
}
