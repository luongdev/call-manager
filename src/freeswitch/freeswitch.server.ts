import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { FreeSwitchServer } from 'esl';
import { LoggerService } from '@logger/logger.service';
import { LoggerFactory } from '../providers/logger/logger.factory';
import { FreeswitchConfig } from './freeswitch.config';
import { FreeSwitchResponse } from 'esl/types/src/response';
import { Logger, SocketConnection, SocketDrop } from './freeswitch.type';

@Injectable()
export  class FreeswitchServer implements OnApplicationBootstrap {

  private readonly _server: FreeSwitchServer;
  private readonly _serverEnabled: boolean;
  private readonly _serverListenPort: number;

  private readonly _log: LoggerService;


  constructor(loggerFactory: LoggerFactory, fsConfig: FreeswitchConfig) {
    this._log = loggerFactory.createLogger(FreeswitchServer);

    this._serverEnabled = fsConfig.serverEnabled;
    this._serverListenPort = fsConfig.serverPort;
    this._server = new FreeSwitchServer({ all_events: true, my_events: false, logger: new Logger(this._log) });

    this._server.on('connection', this.onSocketConnect.bind(this));
    this._server.on('drop', this.onSocketDrop.bind(this));
    this._server.on('error', this.onSocketError.bind(this));

  }

  async onApplicationBootstrap() {
    if (this._serverEnabled) {
      await this._server.listen({ host: '0.0.0.0', port: this._serverListenPort });
    }

  }

  private async onSocketConnect(socket: FreeSwitchResponse, data: SocketConnection) {
    await socket.linger();

    this._log.info('New connection from FreeSwitch: {}', data);


    socket.on('DTMF',  (event) => {
      const dtmfEvent = {
        'digit': event.body['DTMF-Digit'],
        'duration': event.body['DTMF-Duration'],
        'source': event.body['DTMF-Source'],
        'uniqueId': event.body['Unique-ID'],
      };
      console.log('DTMF', dtmfEvent);
    });

    socket.on('RECV_INFO', async (event) => {

      if (event.body['_body']) {
        try {
          console.log(await socket.api(`uuid_kill ${event.body['Unique-ID']}`));
        } catch (e) {
          console.log('Error', e);
        }
      }
    });

    await socket.execute('answer', null);
    setTimeout(async () => {
      await socket.execute('bridge', '{hangup_after_bridge=false}sofia/gateway/to_ivr/0987654321');
    }, 5000);

    setInterval(async () => {
      console.log('CURRENT: ', await this._server.getConnectionCount());
    }, 5000);
  }

  private async onSocketDrop(data: SocketDrop) {
    console.log('Drop', data);
  }

  private async  onSocketError(error: Error) {
    console.log('Error', error);
  }

}
