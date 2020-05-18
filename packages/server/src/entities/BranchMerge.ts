import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('branch_merge', { schema: 'public' })
export class BranchMerge {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'source_branch_id', nullable: true })
  sourceBranchId: number | null;

  @Column('integer', { name: 'target_branch_id' })
  targetBranchId: number;

  @Column('boolean', { name: 'cros_merge', nullable: true })
  crosMerge: boolean | null;

  @Column('character varying', { name: 'type', length: 255 })
  type: string;

  @Column('character varying', { name: 'commit_id', length: 255 })
  commitId: string;

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
