import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logger/logger.service';
import { LoggerFactory } from '@providers/logger/logger.factory';

@Injectable()
export class TestService {
  private readonly logger: LoggerService;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(TestService);

    this.logger.info('TestService has been initialized {}',new Date());
  }
}
