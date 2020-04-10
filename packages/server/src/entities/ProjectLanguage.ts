import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('project_language', { schema: 'public' })
export class ProjectLanguage {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'project_id' })
  projectId: number;

  @Column('integer', { name: 'language_id' })
  languageId: number;

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

  @Column('boolean', { name: 'delete' })
  delete: boolean;
}
