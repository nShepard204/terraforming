import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Event } from '../entities/event.js';
import { Host } from '../entities/host.js';
import { Venue } from '../entities/venue.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Event, Host, Venue],
  synchronize: false,
  logging: false,
});
