import { FreeSwitchClient, FreeSwitchClientLogger, FreeSwitchResponse } from 'esl';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerFactory } from '@providers/logger/logger.factory';
import { LoggerService } from '@logger/logger.service';
import { FreeswitchConfig } from './freeswitch.config';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.type';

class Logger implements FreeSwitchClientLogger {
  constructor(private readonly _log: LoggerService) {
  }


  debug(msg: string, data: unknown): void {
    this._log?.debug(`${msg}`, data);
  }

  error(msg: string, data: unknown): void {
    const error = data?.['error'];

    this._log?.error(msg, error, data);
  }

  info(msg: string, data: unknown): void {
    this._log?.log(msg, data);
  }

}


@Injectable()
export class FreeswitchService implements OnApplicationBootstrap {
  private readonly _client: FreeSwitchClient;

  private readonly _log: LoggerService;

  constructor(loggerFactory: LoggerFactory, configService: ConfigService<AllConfigType>) {
    this._log = loggerFactory.createLogger(FreeswitchService);
    const fsConfig = configService.get<FreeswitchConfig>('fs', { infer: true });

    const opts = {
      host: fsConfig.host,
      port: fsConfig.port,
      password: fsConfig.password,
      logger: new Logger(this._log),
    };

    this._client = new FreeSwitchClient(opts);

    this._client.on('connect', (call: FreeSwitchResponse) => {
      this._log.log('Connected to FreeSwitch: {}', call.stats);
    });

    this._client.on('error', (error: Error) => {
      this._log.error('Error connecting to FreeSwitch', error);
      if (error?.message?.indexOf('freeswitch_auth_request')) this._client.end();
    });

    this._client.on('reconnecting', (timeout) => {
      this._log.info('Reconnecting to FreeSwitch after {}ms', timeout);
    });

    this._client.on('end', () => {
      throw new Error('Freeswitch connection end!');
    });
  }

  onApplicationBootstrap() {
    this._client.connect();
  }
}
