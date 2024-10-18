import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'channels' })
export class Channel {
  @PrimaryColumn({ name: 'uuid' })
    id: string;

  @Column({ name: 'name' })
    name: string;

  @Column({ name: 'ip_addr' })
    ipAddress: string;
  
  @Column({ name: 'cid_num' })
    cidNum: string;

  @Column({ name: 'cid_name' })
    cidName: string;
}
