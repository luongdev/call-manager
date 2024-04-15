import { FreeSwitchClient, FreeSwitchClientLogger, FreeSwitchResponse, FreeSwitchServer } from 'esl';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerFactory } from '@providers/logger/logger.factory';
import { LoggerService } from '@logger/logger.service';
import { FreeswitchConfig } from './freeswitch.config';

class Logger implements FreeSwitchClientLogger {
  constructor(private readonly _log: LoggerService) {
  }

  debug(msg: string, data: unknown): void {
    return this._log?.debug(`${msg}`, data);
  }

  error(msg: string, data: unknown): void {
    const error = data?.['error'];

    return this._log?.error(`${msg}. Reply: {}`, error, data);
  }

  info(msg: string, data: unknown): void {
    return this._log?.log(msg, data);
  }

}

type ESLSocket = FreeSwitchResponse;

@Injectable()
export class FreeswitchService implements OnApplicationBootstrap {
  private readonly _client: FreeSwitchClient;
  private readonly _sendTimeout: number;

  private readonly _log: LoggerService;

  private _instance: ESLSocket;

  constructor(loggerFactory: LoggerFactory, fsConfig: FreeswitchConfig) {
    this._log = loggerFactory.createLogger(FreeswitchService);
    this._client = new FreeSwitchClient({
      host: fsConfig.host,
      port: fsConfig.port,
      password: fsConfig.password,
      logger: new Logger(this._log),
    });
    this._sendTimeout = fsConfig.sendTimeout;

    this._client.on('connect', (call: FreeSwitchResponse) => {
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

  async onApplicationBootstrap() {
    // this._client.connect();

    const server = new FreeSwitchServer({
      all_events: true,
      my_events: false,
      logger: new Logger(this._log),
    });

    await server.listen({
      host: '0.0.0.0',
      port: 3001
    });

    server.on('connection', async (socket, data) => {
      this._log.info('New connection from FreeSwitch: {}', data);

      await socket.linger();

      socket.on('DTMF', async (event) => {
        console.log('DTMF', event);
      });

      // socket.on('RECV_INFO', async (event) => {
      //
      //   if (event.body['_body']) {
      //     try {
      //       console.log(await socket.api(`uuid_kill ${event.body['Unique-ID']}`));
      //     } catch (e) {
      //       console.log('Error', e);
      //     }
      //   }
      // });

      await socket.execute('answer', null);
      setTimeout(async () => {
        await socket.execute('bridge', '{hangup_after_bridge=false}sofia/gateway/to_ivr/0987654321');
      }, 5000);
    });

    setInterval(async () => {
      console.log('CURRENT: ', await server.getConnectionCount());
    }, 5000);
  }

  async exec(app: string, ...args: string[]) {
    try {
      const res = await this._instance?.api(`${app} ${args?.join(' ')}`, this._sendTimeout);

      return res?.body;
    } catch (e) {
      this._log.error('Error executing command', e);
    }
  }

}
