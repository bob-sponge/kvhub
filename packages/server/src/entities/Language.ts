import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('language', { schema: 'public' })
export class Language {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;
}
