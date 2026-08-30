import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from './event.ts';

@Entity({ name: 'hosts' })
export class Host {
  @PrimaryGeneratedColumn('identity', {
    type: 'int',
    generatedIdentity: 'ALWAYS',
  })
  id!: number;

  @Column({ type: 'text', nullable: true, unique: true })
  name!: string | null;

  @Column({ type: 'text', nullable: true })
  email!: string | null;

  @Column({ name: 'phone_number', type: 'text', nullable: true })
  phoneNumber!: string | null;

  @OneToMany(() => Event, (event) => event.host)
  events!: Event[];
}
