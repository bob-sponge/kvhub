import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('branch_commit', { schema: 'public' })
export class BranchCommit {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'branch_id' })
  branchId: number;

  @Column('character varying', { name: 'commit_id', length: 255 ,nullable:true})
  commitId: string;
  
  @Column('timestamp without time zone', { name: 'commit_time' })
  commitTime: Date;

  @Column('character varying', { name: 'type', length: 255 })
  type: string;
}
