import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('keyname', { schema: 'public' })
export class Keyname {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'key_id' })
  keyId: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

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

  @Column('integer', { name: 'commit_id' })
  commitId: number;
}
