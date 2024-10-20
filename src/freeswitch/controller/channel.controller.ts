import { Body, Controller, Delete, Inject, Param, Put } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel } from '../entity/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketStore } from '../freeswitch.type';

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

  @Delete(':id/kill')
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
      const res = await sk.execute_uuid(id, 'transfer', destination);


      return { success: true, res, message: 'Channel transferred' };
    }

    return { success: false, message: 'Channel not found' };
  }
}
