import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venue } from './venue.ts';
import { Host } from './host.ts';

export enum EventType {
  LOCAL = 'Local',
  REGIONAL = 'Regional',
  YCS = 'YCS',
  WCQ = 'WCQ',
  WORLDS = 'Worlds',
  CASE_TOURNAMENT = 'Case Tournament',
  OTS_CHAMPIONSHIP = 'OTS Championship',
  SNEAK_PEEK = 'Sneak Peek',
  YU_GI_OH_DAY = 'Yu-Gi-Oh Day',
}

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn('identity', {
    type: 'int',
    generatedIdentity: 'ALWAYS',
  })
  id!: number;

  @Column({ name: 'venue_id', type: 'int' })
  venueId!: number;

  @ManyToOne(() => Venue, (venue) => venue.events)
  @JoinColumn({ name: 'venue_id', foreignKeyConstraintName: 'ref_venue' })
  venue!: Venue;

  @Column({ name: 'host_id', type: 'int' })
  hostId!: number;

  @ManyToOne(() => Host, (host) => host.events)
  @JoinColumn({ name: 'host_id', foreignKeyConstraintName: 'ref_host' })
  host!: Host;

  @Column({ type: 'date', nullable: true })
  date!: string | null;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime!: string | null;

  @Column({ type: 'boolean', nullable: true })
  genesys!: boolean | null;

  @Column({ name: 'dragon_duels', type: 'boolean', nullable: true })
  dragonDuels!: boolean | null;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: EventType,
    enumName: 'event_types',
    nullable: true,
  })
  eventType!: EventType | null;
}
