import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user', { schema: 'public' })
export class User {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('character varying', {
    name: 'department',
    nullable: true,
    length: 255,
  })
  department: string | null;

  @Column('character varying', { name: 'type', nullable: true, length: 255 })
  type: string | null;

  @Column('character varying', { name: 'admin', length: 255 })
  admin: string;
}
