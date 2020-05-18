import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('keyvalue', { schema: 'public' })
export class Keyvalue {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'value', length: 255 })
  value: string;

  @Column('integer', { name: 'key_id' })
  keyId: number;

  @Column('integer', { name: 'language_id' })
  languageId: number;

  @Column('integer', { name: 'merge_id', nullable: true })
  mergeId: number | null;


  @Column('character varying', { name: 'commit_id', length: 255 ,nullable:true})
  commitId: string;

  @Column('character varying', {
    name: 'modifier',
    nullable: true,
    length: 255,
  })
  modifier: string | null;

  @Column('timestamp without time zone', {
    name: 'midify_time',
    nullable: true,
  })
  midifyTime: Date | null;

  @Column('boolean', { name: 'latest', nullable: true })
  latest: boolean | null;
}
