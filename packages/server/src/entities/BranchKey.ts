import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('branch_key', { schema: 'public' })
export class BranchKey {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'branch_id' })
  branchId: number;

  @Column('integer', { name: 'key_id' })
  keyId: number;

  @Column('boolean', { name: 'delete' })
  delete: boolean;
}
