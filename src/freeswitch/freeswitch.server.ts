import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { FreeSwitchResponse, FreeSwitchServer } from 'esl';
import { LoggerService } from '@logger/logger.service';
import { LoggerFactory } from '../providers/logger/logger.factory';
import { FreeswitchConfig } from './freeswitch.config';
import { Logger, SocketStore } from './freeswitch.type';
import { AppConfig } from '../config/app.config';

import { parse } from 'sdp-transform';

@Injectable()
export class FreeswitchServer implements OnApplicationBootstrap {

  private readonly _server: FreeSwitchServer;
  private readonly _serverEnabled: boolean;
  private readonly _serverListenPort: number;

  private readonly _socketStore: SocketStore;
  private readonly _botAddress: string;

  private readonly _log: LoggerService;

  constructor(
    loggerFactory: LoggerFactory,
    fsConfig: FreeswitchConfig,
    appConfig: AppConfig,
    @Inject(SocketStore) socketStore: SocketStore) {

    if (!fsConfig.serverEnabled) return;

    this._log = loggerFactory.createLogger(FreeswitchServer);
    this._botAddress = appConfig.botAddress;

    this._serverEnabled = fsConfig.serverEnabled;
    this._serverListenPort = fsConfig.serverPort;
    this._server = fsConfig.serverEnabled && new FreeSwitchServer({ logger: new Logger(this._log, fsConfig.debug) });

    this._socketStore = socketStore;

    this._server.on('connection', async (socket, { data, body, uuid }) => {
      try {
        this._socketStore.set(uuid, socket);
        await this.onSocketConnect(socket, { data, body, uuid });
      } catch (e) {
        this._log.error('Execute call {}', e, uuid);
      }
    });
  }

  async onApplicationBootstrap() {
    if (this._serverEnabled) {
      await this._server.listen({ host: '0.0.0.0', port: this._serverListenPort });
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

    const reqSdp = parse(data['variable_switch_r_sdp']);
    const rtpCodecs = reqSdp?.media?.find(m => m.type === 'audio')?.rtp?.map(r => r);

    const metadata = {
      id: uuid,
      callerNum: data['Channel-ANI'] || data['variable_sip_from_user'],
      calleeNum: data['Channel-Destination-Number'] || data['variable_sip_to_user'],
      audio: {
        ip: reqSdp?.connection?.ip,
        port: reqSdp?.media.find(m => m.type === 'audio')?.port,
        codecs: rtpCodecs,
      }
    };
    const sample = 8000;

    const aResult = await socket.api(
      // eslint-disable-next-line max-len
      `uuid_audio_fork ${uuid} start ${this._botAddress} mono ${sample} botbug ${JSON.stringify(metadata)} true true ${sample}`
    );

    if (aResult) {
      this._log.info('Call {} connected', uuid);
    }
  }
}
