import 'dotenv/config';
import { convertMilesToMeters } from '../helpers/helpers.ts';
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
    console.log(`Address Param Error: ${address}`);
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

  // Geocodes an address and also pulls the 2-letter region/country codes out
  // of the result, matching how scraped venues store `state` and `country`.
  // `region_code` isn't in the SDK's types but the v6 API returns it.
  static async geocodeVenueAddress(address: string): Promise<
    | {
        location: VenueLocation;
        state: string | null;
        country: string | null;
      }
    | undefined
  > {
    const results = await this.geocode.forward(address);
    const feature = results.features[0];
    if (feature === undefined) return;

    const context = feature.properties.context as {
      region?: { region_code?: string };
      country?: { country_code?: string };
    };

    return {
      location: {
        type: 'Point',
        coordinates: [
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1],
        ],
      },
      state: context.region?.region_code?.slice(0, 2).toUpperCase() ?? null,
      country: context.country?.country_code?.toUpperCase() ?? null,
    };
  }
}
