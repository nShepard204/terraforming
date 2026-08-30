import { Venue } from '../entities/venue.ts';
import { AppDataSource } from '../db/data-source.ts';

export const venueRepository = AppDataSource.getRepository(Venue);
