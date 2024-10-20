import { Controller, Inject } from '@nestjs/common';
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
  }

  
}
