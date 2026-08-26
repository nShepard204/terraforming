import 'dotenv/config';
import { type VenueCoords } from './venue.ts';
import pkg from '@mapbox/search-js-core';
const { GeocodingCore } = pkg;

export async function searchAddressCoordinates(
  address: string
): Promise<VenueCoords | undefined> {
  const geocode = new GeocodingCore({
    accessToken: process.env.MAPBOX_API_KEY,
  });
  const results = await geocode.forward(address);

  if (results.features.length === 0) return;

  const coords: VenueCoords = {
    lng: results.features[0].geometry.coordinates[0],
    lat: results.features[0].geometry.coordinates[1],
  };

  return coords;
}
