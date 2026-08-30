import { Event } from '../entities/event.ts';
import { AppDataSource } from '../db/data-source.ts';

export const eventRepository = AppDataSource.getRepository(Event);
