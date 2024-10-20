import { FreeSwitchClient, FreeSwitchResponse } from 'esl';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerFactory } from '@providers/logger/logger.factory';
import { LoggerService } from '@logger/logger.service';
import { FreeswitchConfig } from './freeswitch.config';
import { ESLSocket, Logger, SocketStore } from './freeswitch.type';


@Injectable()
export class FreeswitchService implements OnApplicationBootstrap {
  private readonly _client: FreeSwitchClient;
  private _instance: ESLSocket;

  private readonly _clientEnabled: boolean;
  private readonly _sendTimeout: number;

  private readonly _log: LoggerService;
  constructor(
    loggerFactory: LoggerFactory,
    fsConfig: FreeswitchConfig,
      @Inject(SocketStore) socketStore: SocketStore) {
    if (!fsConfig.clientEnabled) return;
    
    this._log = loggerFactory.createLogger(FreeswitchService);
    this._clientEnabled = fsConfig.clientEnabled;
    this._client = new FreeSwitchClient({
      host: fsConfig.host,
      port: fsConfig.port,
      password: fsConfig.password,
      logger: new Logger(this._log, fsConfig.debug),
    });
    this._sendTimeout = fsConfig.sendTimeout;

    this._client.on('connect', (call: FreeSwitchResponse) => {
      socketStore.set('inbound', call);
      this._instance = call;
      this._log.log('Connected to FreeSwitch [{}:{}]', fsConfig.host, fsConfig.port);
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
    if (this._clientEnabled) {
      this._client.connect();
    }
  }

  async exec(app: string, ...args: string[]) {
    try {
      const res = await this._instance?.api(`${app} ${args?.join(' ')}`, this._sendTimeout);

      return res?.body;
    } catch (e) {
      this._log.error('Error executing command', e);
    }
  }

  get socket(): ESLSocket {
    return this._instance;
  }
}
