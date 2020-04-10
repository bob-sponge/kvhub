import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('merge_diff_change_key', { schema: 'public' })
export class MergeDiffChangeKey {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'merge_id' })
  mergeId: number;

  @Column('integer', { name: 'branch_id' })
  branchId: number;

  @Column('character varying', { name: 'key', length: 255 })
  key: string;

  @Column('character varying', { name: 'language', length: 255 })
  language: string;

  @Column('character varying', { name: 'value', length: 255 })
  value: string;

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
}
