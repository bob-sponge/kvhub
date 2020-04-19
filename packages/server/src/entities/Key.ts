import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('key', { schema: 'public' })
export class Key {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'actual_id', nullable: false })
  actualId: number;

  @Column('integer', { name: 'namespace_id', nullable: true })
  namespaceId: number | null;

  @Column('character varying', {
    name: 'modifier',
    nullable: true,
    length: 255,
  })
  modifier: string | null;

  @Column('timestamp without time zone', {
    name: 'modify_time',
    nullable: true,
  })
  modifyTime: Date | null;

  @Column('boolean', { name: 'delete', nullable: true })
  delete: boolean | null;
}
