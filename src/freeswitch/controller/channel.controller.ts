import { Controller } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel } from '../entity/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('channel')
export class ChannelController {
  private readonly _channelRepository: Repository<Channel>;

  constructor(@InjectRepository(Channel) channelRepository: Repository<Channel>) {
    this._channelRepository = channelRepository;
  }

  
}
