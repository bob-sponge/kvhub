import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('merge_diff_key', { schema: 'public' })
export class MergeDiffKey {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'merge_id' })
  mergeId: number;

  /**
   * 关联的是key表中的actualId
   */
  @Column('integer', { name: 'key' })
  key: number;

  @Column('integer', { name: 'select_branch_id', nullable: true })
  selectBranchId: number;
}
