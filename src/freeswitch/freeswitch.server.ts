import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { FreeSwitchResponse, FreeSwitchServer } from 'esl';
import { LoggerService } from '@logger/logger.service';
import { LoggerFactory } from '../providers/logger/logger.factory';
import { FreeswitchConfig } from './freeswitch.config';
import { Logger, SocketDrop } from './freeswitch.type';

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
    this._server = fsConfig.serverEnabled && new FreeSwitchServer({ logger: new Logger(this._log) });

    this._server.on('connection', this.onSocketConnect.bind(this));
    this._server.on('drop', this.onSocketDrop.bind(this));
    this._server.on('error', this.onSocketError.bind(this));

  }

  async onApplicationBootstrap() {
    if (this._serverEnabled) {
      await this._server.listen({ host: '0.0.0.0', port: this._serverListenPort });

      setInterval(async () => {
        console.log('Calls: ', await this.countConnections());
      }, 5000);
    }

  }

  async countConnections() {
    return await this._server.getConnectionCount();
  }

  getMaxConnections() {
    return this._server.getMaxConnections();
  }



  private async onSocketConnect(socket: FreeSwitchResponse, { data, body, uuid }) {
    if (!uuid || (!data && !body)) {
      this._log.warn('Invalid connection from FreeSwitch: {}', uuid);
      this._log.debug('Data: {}', JSON.stringify(data));
    }

    const headers = body ?? data;
    const dialedNumber = headers['variable_sip_to_user'] ?? headers['variable_sip_req_user'];
    const phoneNumber = headers['Channel-Caller-ID-Number'] ?? headers['Channel-ANI'];

    if (!dialedNumber || !phoneNumber) {
      this._log.warn('Invalid connection from FreeSwitch: {}', uuid);
    }

    let result;
    try {
      result = await socket.execute('answer', null);
    } catch (e) {
      this._log.error('Error executing command', e);
    }
    if (result?.headers?.['Reply-Text']?.indexOf('+OK') > -1) {
      try {
        await socket.linger();
        socket.on('CHANNEL_HANGUP_COMPLETE', (event) => {
          console.log('CHANNEL_HANGUP_COMPLETE', event.headers);
        });

        result = await socket.execute(
          'bridge',
          // eslint-disable-next-line max-len
          `{hangup_after_bridge=false,sip_from_user=${phoneNumber},sip_h_X-ID=${uuid}}sofia/gateway/to_ivr/${dialedNumber}`
        );
      } catch (e) {
        this._log.error('Error executing command', e);
      }
    }

    this._log.log('New connection from FreeSwitch: {}', uuid);
  }

  private async onSocketDrop(data: SocketDrop) {
    console.log('Drop', data);
  }

  private async  onSocketError(error: Error) {
    console.log('Error', error);
  }


  // private async onSocketConnect(socket: FreeSwitchResponse, data: SocketConnection) {
  //   await socket.linger();
  //
  //   this._log.info('New connection from FreeSwitch: {}', data);
  //
  //
  //   socket.on('DTMF',  (event) => {
  //     const dtmfEvent = {
  //       'digit': event.body['DTMF-Digit'],
  //       'duration': event.body['DTMF-Duration'],
  //       'source': event.body['DTMF-Source'],
  //       'uniqueId': event.body['Unique-ID'],
  //     };
  //     console.log('DTMF', dtmfEvent);
  //   });
  //
  //   socket.on('RECV_INFO', async (event) => {
  //
  //     if (event.body['_body']) {
  //       try {
  //         console.log(await socket.api(`uuid_kill ${event.body['Unique-ID']}`));
  //       } catch (e) {
  //         console.log('Error', e);
  //       }
  //     }
  //   });
  //
  //   await socket.execute('answer', null);
  //   setTimeout(async () => {
  //     await socket.execute('bridge', '{hangup_after_bridge=false}sofia/gateway/to_ivr/0987654321');
  //   }, 5000);
  //
  //   setInterval(async () => {
  //     console.log('CURRENT: ', await this._server.getConnectionCount());
  //   }, 5000);
  // }
}
