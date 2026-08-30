import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from './Event.js';

@Entity({ name: 'venues' })
export class Venue {
  @PrimaryGeneratedColumn('identity', { type: 'int', generatedIdentity: 'ALWAYS' })
  id!: number;

  @Column({ type: 'text', nullable: true, unique: true })
  name!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state!: string | null;

  @Column({ type: 'text', nullable: true })
  country!: string | null;

  @Column({ name: 'player_cap', type: 'int', nullable: true })
  playerCap!: number | null;

  @Column('geography', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location!: string | null;

  @Column({ type: 'text', nullable: true })
  timezone!: string | null;

  @OneToMany(() => Event, (event) => event.venue)
  events!: Event[];
}
