import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Event } from '../entities/Event.js';
import { Host } from '../entities/Host.js';
import { Venue } from '../entities/Venue.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Event, Host, Venue],
  synchronize: false,
  logging: false,
});
