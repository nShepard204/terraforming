import { type DeepPartial, type QueryDeepPartialEntity } from 'typeorm';
import { Event } from '../entities/event.ts';
import { Host } from '../entities/host.ts';
import { Venue } from '../entities/venue.ts';
import { AppDataSource } from '../db/data-source.ts';
import { eventRepository } from '../repositories/event.ts';

export class EventService {
  static async createEvent(data: DeepPartial<Event>): Promise<Event> {
    return await eventRepository.save(eventRepository.create(data));
  }

  // Creates any new venue/host and the event in one transaction, so a failed
  // event insert doesn't leave behind a venue or host nobody asked for.
  static async createSubmittedEvent({
    event,
    newVenue,
    newHost,
  }: {
    event: DeepPartial<Event>;
    newVenue?: DeepPartial<Venue>;
    newHost?: DeepPartial<Host>;
  }): Promise<Event> {
    return await AppDataSource.transaction(async (manager) => {
      const data = { ...event };
      if (newVenue !== undefined) {
        const venues = manager.getRepository(Venue);
        data.venueId = (await venues.save(venues.create(newVenue))).id;
      }
      if (newHost !== undefined) {
        const hosts = manager.getRepository(Host);
        data.hostId = (await hosts.save(hosts.create(newHost))).id;
      }
      const events = manager.getRepository(Event);
      return await events.save(events.create(data));
    });
  }

  static async getEventById(id: number): Promise<Event | null> {
    return await eventRepository.findOne({
      where: { id },
      relations: { venue: true, host: true },
    });
  }

  static async getEventByHeuristic(
    data: DeepPartial<Event>
  ): Promise<Event | null> {
    return await eventRepository.findOne({
      where: {
        venueId: data.venueId,
        hostId: data.hostId,
        date: data.date!,
      },
    });
  }

  static async getAllEvents(): Promise<Event[]> {
    return await eventRepository.find({
      relations: { venue: true, host: true },
    });
  }

  static async updateEvent(
    id: number,
    data: QueryDeepPartialEntity<Event>
  ): Promise<Event | null> {
    await eventRepository.update(id, data);
    return this.getEventById(id);
  }

  static async deleteEvent(id: number): Promise<boolean> {
    const result = await eventRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  static async upsertScrapedEvent(
    data: DeepPartial<Event>
  ): Promise<Event | null> {
    const existingEvent = await this.getEventByHeuristic(data);
    if (existingEvent !== null) {
      return await this.updateEvent(existingEvent.id, data);
    } else {
      return await this.createEvent(data);
    }
  }
}
