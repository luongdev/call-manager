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
    if (!fsConfig.serverEnabled) return;

    this._log = loggerFactory.createLogger(FreeswitchServer);
    
    this._serverEnabled = fsConfig.serverEnabled;
    this._serverListenPort = fsConfig.serverPort;
    this._server = fsConfig.serverEnabled && new FreeSwitchServer({ logger: new Logger(this._log, fsConfig.debug) });

    this._server.on('connection', async (socket, { data, body, uuid }) => {
      try {
        await this.onSocketConnect(socket, {  data, body, uuid });
      } catch (e) {
        this._log.error('Execute call {}', e, uuid);
      }
    });
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

    const CallUUIDHeader = 'Channel-Call-UUID';

    let result = await socket.execute('answer', null);
    if (result?.headers?.['Reply-Text']?.indexOf('+OK') > -1) {
      console.log('Data: ', JSON.stringify(await socket.filter(CallUUIDHeader, uuid)));

      socket.on('CHANNEL_HANGUP_COMPLETE', (event) => {
        console.log('CHANNEL_HANGUP_COMPLETE', event.headers);
      });

      socket.on('CHANNEL_BRIDGE', (event) => {
        socket['bridged'] = event?.body?.['Other-Leg-Unique-ID'];

        console.log(`Channel ${uuid} is bridged with ${socket['bridged']}`);
      });

      socket.on('CHANNEL_UNBRIDGE', async (event) => {
        try {
          console.log(`Channel ${uuid} is unbridged with ${socket['bridged']}. Trying to route to ACD...`);

          // result = await socket.execute(
          //   'bridge',
          //   `{sip_from_user=${phoneNumber},sip_h_X-ID=${uuid}}sofia/external/0969069069@103.229.40.170:5080`
          // );
        } catch (ignored) {}
      });

      socket.on('RECV_INFO', async (event) => {
        if (event?.body?.['_body']) {
          try {
            console.log('RECV_INFO', event?.body?.['_body']);

            if (socket['bridged']) {
              console.log('Killing bridged channel ', await socket.api(`uuid_kill ${socket['bridged']}`));
              console.log('Killing bridged channel ', socket['bridged']);
            } else {
              console.log('No bridged call to kill');
            }
          } catch (ignored) {}

          // result = await socket.execute(
          //   'bridge',
          //   `{sip_from_user=${phoneNumber},sip_h_X-ID=${uuid}}sofia/gateway/to_ivr/${dialedNumber}`
          // );
        }
      });

      result = await socket.execute(
        'bridge',
        `{sip_from_user=${phoneNumber},sip_h_X-ID=${uuid}}sofia/gateway/to_ivr/${dialedNumber}`
      );

      console.log(JSON.stringify(result, null, 2));
    }
  }

  private async onSocketDrop(data: SocketDrop) {
    console.log('Drop', data);

    await new Promise(resolve => resolve(null));
  }

  private async  onSocketError(error: Error) {
    console.log('Error', error);

    await new Promise(resolve => resolve(null));
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
