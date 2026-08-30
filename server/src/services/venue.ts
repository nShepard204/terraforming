import { type DeepPartial, type QueryDeepPartialEntity } from 'typeorm';
import { Venue } from '../entities/venue.ts';
import { venueRepository } from '../repositories/venue.ts';

export class VenueService {
  static async createVenue(data: DeepPartial<Venue>): Promise<Venue> {
    return venueRepository.save(venueRepository.create(data));
  }

  static async getVenueById(id: number): Promise<Venue | null> {
    return venueRepository.findOneBy({ id });
  }

  static async getVenueByName(name: string): Promise<Venue | null> {
    return venueRepository.findOneBy({ name });
  }

  static async getAllVenues(): Promise<Venue[]> {
    return venueRepository.find();
  }

  static async updateVenue(
    id: number,
    data: QueryDeepPartialEntity<Venue>
  ): Promise<Venue | null> {
    await venueRepository.update(id, data);
    return this.getVenueById(id);
  }

  static async deleteVenue(id: number): Promise<boolean> {
    const result = await venueRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
