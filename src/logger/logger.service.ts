import { Injectable, Type } from '@nestjs/common';
import { LoggerService as NestLoggerService } from '@nestjs/common/services/logger.service';
import { Logger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;
  private readonly marker: Type | string;

  constructor(logger: Logger, marker: Type | string = 'main') {
    this.logger = logger;
    this.marker = marker;
  }


  log(message: string, ...args: any[]) {
    this.logger.info(message, { args, marker: this.marker });
  }

  info(message: string, ...args: any[]) {
    this.log(message, ...args);
  }

  error(message: string, trace: Error, ...args: any[]) {
    this.logger.error(message, { trace, args, marker: this.marker });
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn(message, { args, marker: this.marker });
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug(message, { args, marker: this.marker });
  }

  verbose(message: string, ...args: any[]) {
    this.logger.verbose(message, { args, marker: this.marker });
  }
}
