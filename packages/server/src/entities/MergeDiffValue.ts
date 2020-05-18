import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('merge_diff_value', { schema: 'public' })
export class MergeDiffValue {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'merge_diff_key_id' })
  mergeDiffKeyId: number;

  @Column('integer', { name: 'value_id'})
  valueId: number;

  @Column('integer', { name: 'branch_id' })
  branchId: number;

  @Column('integer', { name: 'language_id' })
  languageId:number;
}
