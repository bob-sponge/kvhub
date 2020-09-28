import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user', { schema: 'public' })
export class User {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('character varying', { name: 'password', nullable: true, length: 255 })
  password: string;

  @Column('character varying', {
    name: 'department',
    nullable: true,
    length: 255,
  })
  department: string | null;

  @Column('character varying', { name: 'type', nullable: true, length: 255 })
  type: string | null;

  @Column({ name: 'admin', default: 1, nullable: true })
  admin: number;

  @Column({ name: 'permission', nullable: true, length: 255 })
  permission: string;

  @Column({ name: 'last_time', nullable: true })
  lastTime: Date | null;

  lastTimestamp: number;
}
