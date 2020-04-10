import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('project', { schema: 'public' })
export class Project {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('character varying', { name: 'reference_language', length: 255 })
  referenceLanguage: string;

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

  @Column('character varying', { name: 'type', length: 255 })
  type: string;
}
