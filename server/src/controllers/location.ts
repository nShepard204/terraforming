import 'dotenv/config';
import {
  convertMetersToMiles,
  convertMilesToMeters,
} from '../helpers/helpers.ts';
import { Event } from '../entities/event.ts';
import { VenueLocation } from '../entities/venue.ts';
import { eventRepository } from '../repositories/event.ts';
import pkg from '@mapbox/search-js-core';
const { GeocodingCore } = pkg;

export class LocationController {
  private static geocode = new GeocodingCore({
    accessToken: process.env.MAPBOX_API_KEY,
  });

  static async getNearbyEvents(
    address: string,
    distance: number
  ): Promise<Event[]> {
    const userCoords = await this.getAddressCoordinates(address);
    if (userCoords === undefined) return [];

    const distanceMeters = convertMilesToMeters(distance);
    const [lng, lat] = userCoords.coordinates;

    return eventRepository
      .createQueryBuilder('event')
      .innerJoinAndSelect('event.venue', 'venue')
      .innerJoinAndSelect('event.host', 'host')
      .where(
        'ST_DWithin(venue.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :distanceMeters)',
        { lng, lat, distanceMeters }
      )
      .andWhere('event.date > CURRENT_DATE')
      .getMany();
  }

  static async getAddressCoordinates(
    address: string
  ): Promise<VenueLocation | undefined> {
    const results = await this.geocode.forward(address);

    if (results.features.length === 0) return;

    const coords: VenueLocation = {
      type: 'Point',
      coordinates: [
        results.features[0].geometry.coordinates[0],
        results.features[0].geometry.coordinates[1],
      ],
    };

    return coords;
  }
}

// export async function getNearbyVenues(userAddress: string, distance: number) {
//   const userCoords = await searchAddressCoordinates(userAddress);
//   if (userCoords === undefined) return;

//   const distanceMeters = convertMilesToMeters(distance);
//   const sql =
//     'SELECT * FROM venues_coords WHERE venues_coords.id IN (SELECT id FROM venues WHERE ST_DWithin(location::geography, ST_MakePoint($1, $2)::geography, $3))';
//   const { rows, command } = await query(sql, [
//     userCoords.lng,
//     userCoords.lat,
//     distanceMeters,
//   ]);
//   return rows;
// }

//await getNearbyVenues('2299 Waters Edge Blvd, Columbus, OH 43209', 160);
