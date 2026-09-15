import 'reflect-metadata';
import 'dotenv/config';
import { Pool } from 'pg';
import { DataSource } from 'typeorm';
import { Event } from '../entities/event.ts';
import { Host } from '../entities/host.ts';
import { Venue } from '../entities/venue.ts';
import { AddSubmittedByToEvents1789478472677 } from './migrations/1789478472677-AddSubmittedByToEvents.ts';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Event, Host, Venue],
  migrations: [AddSubmittedByToEvents1789478472677],
  synchronize: false,
  logging: false,
  driver: { Pool },
});
