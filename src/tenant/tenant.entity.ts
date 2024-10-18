import { Column, Entity } from 'typeorm';

@Entity({ name: 'tenants' })
export class TenantEntity {

    @Column({ type: 'varchar', length: 36, primary: true })
      id: string;

    @Column({ type: 'varchar', length: 255, primary: true })
      name: string;

    @Column({ type: 'varchar', length: 255, primary: true })
      enabled: string;
}
