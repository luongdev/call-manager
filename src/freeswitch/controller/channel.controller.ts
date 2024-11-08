import { Body, Controller, Delete, Inject, Param, Put } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel } from '../entity/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { isOk, SocketStore } from '../freeswitch.type';

@Controller('channel')
export class ChannelController {
  private readonly _socketStore: SocketStore;
  private readonly _channelRepository: Repository<Channel>;

  constructor(
        @Inject(SocketStore) socketStore: SocketStore,
        @InjectRepository(Channel) channelRepository: Repository<Channel>) {
    this._channelRepository = channelRepository;
    this._socketStore = socketStore;
  }

    @Delete(':id/hangup')
  async kill(@Param('id') id: string) {
    const channel = await this._channelRepository.findOne({ where: { id } });
    if (channel) {
      const sk = this._socketStore.getOrDefault(id);
      await sk.hangup_uuid(id);

      return { success: true, message: 'Channel killed' };
    }

    this._socketStore.close(id);

    return { success: false, message: 'Channel not found' };
  }

    @Put(':id/transfer')
    async transfer(@Param('id') id: string, @Body('destination') destination: string) {
      const channel = await this._channelRepository.findOne({ where: { id } });
      if (channel) {
        const sk = this._socketStore.getOrDefault(id);
        const res =
                await sk.execute_uuid(id, 'bridge', `{api_on_answer=uuid_audio_fork ${id} stop botbug}${destination}`);
        return { success: true, message: 'Channel transferred' };
      }

      return { success: false, message: 'Channel not found' };
    }

    @Put(':id/record')
    async record(@Param('id') id: string) {
      const channel = await this._channelRepository.findOne({ where: { id } });
      if (channel) {
        const sk = this._socketStore.getOrDefault(id);
        try {
          const paths = await new Promise<any>(async (resolve, reject) => {
            const delm = ';';
            const app = 'multiset';
            const args = [
              'record_stereo=true',
              'record_append=true',
              'record_path=$${recordings_dir}',
              'record_name=${strftime(%Y/%m/%d/%H)}/${uuid}.wav',
            ];

            const timeout = setTimeout(() => reject('Timeout'), 3000);
            sk.on('CHANNEL_EXECUTE_COMPLETE', (event) => {
              const paths = { root: '', path: '' };
              if (app === event.body['Application'] && event.body['Application-Data']?.length) {
                const data = event.body['Application-Data'].split(delm);
                const recordPath = data.find((d) => d.indexOf('record_path=') === 0);
                const recordName = data.find((d) => d.indexOf('record_name=') === 0);

                if (recordPath) paths.root = recordPath.split('=')[1];
                if (recordName) paths.path = recordName.split('=')[1];
              }

              clearTimeout(timeout);
              resolve(paths);
            })

            if (!isOk(await sk.execute_uuid(id, app, args.join(delm)))) {
              reject('Error executing record command');
            }
          });

          if (paths?.root && paths?.path) {
            const res = await sk.execute_uuid(id, 'record_session', `${paths.root}/${paths.path}`);
            if (isOk(res)) {
              return { success: true, filePath: paths.path, message: 'Channel recording' };
            }
          }
        } catch (e) {
          return { success: false, message: e.message };
        }
      }

      return { success: false, message: 'Channel not found' };
    }
}
