import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('merge_diff_key', { schema: 'public' })
export class MergeDiffKey {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'merge_id' })
  mergeId: number;

  @Column('character varying', { name: 'key', length: 255 })
  key: string;

  @Column('integer', { name: 'select_branch_id' })
  selectBranchId: number;
}
