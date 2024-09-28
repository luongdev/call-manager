import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { FreeSwitchResponse, FreeSwitchServer } from 'esl';
import { LoggerService } from '@logger/logger.service';
import { LoggerFactory } from '../providers/logger/logger.factory';
import { FreeswitchConfig } from './freeswitch.config';
import { isOk, Logger, SocketDrop } from './freeswitch.type';

@Injectable()
export class FreeswitchServer implements OnApplicationBootstrap {

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
        await this.onSocketConnect(socket, { data, body, uuid });
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

    let result = await socket.execute('answer', null);
    if (isOk(result)) {
      result = await socket.execute('playback', 'silence_stream://-1');
      if (isOk(result)) {
        await socket.api(`uuid_audio_fork ${uuid} start `);
      }
    }
    
  }

  private async onSocketDrop(data: SocketDrop) {
    console.log('Drop', data);

    await new Promise(resolve => resolve(null));
  }

  private async onSocketError(error: Error) {
    console.log('Error', error);

    await new Promise(resolve => resolve(null));
  }
}
