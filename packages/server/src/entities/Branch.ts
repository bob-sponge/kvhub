import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('branch', { schema: 'public' })
export class Branch {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('integer', { name: 'project_id' })
  projectId: number;

  @Column('boolean', { name: 'master' })
  master: boolean;

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
