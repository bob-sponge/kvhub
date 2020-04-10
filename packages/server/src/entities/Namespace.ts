import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('namespace', { schema: 'public' })
export class Namespace {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('integer', { name: 'project_id' })
  projectId: number;

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

  @Column('character varying', { name: 'type', length: 255 })
  type: string;
}
