import 'dotenv/config';
import { query } from '../db/index.js';
import { type VenueCoords } from './venue.ts';
import pkg from '@mapbox/search-js-core';
const { GeocodingCore } = pkg;

export function convertMilesToMeters(meters: number) {
  return meters * 1609.344;
}

export function convertMetersToMiles(meters: number) {
  const miles = meters / 1609.344;
  return parseFloat(miles.toFixed(2));
}

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

export async function getNearbyVenues(userAddress: string, distance: number) {
  const userCoords = await searchAddressCoordinates(userAddress);
  if (userCoords === undefined) return;

  const distanceMeters = convertMilesToMeters(distance);
  const sql =
    'SELECT * FROM venues_coords WHERE venues_coords.id IN (SELECT id FROM venues WHERE ST_DWithin(location::geography, ST_MakePoint($1, $2)::geography, $3))';
  const { rows, command } = await query(sql, [
    userCoords.lng,
    userCoords.lat,
    distanceMeters,
  ]);
  console.log(rows);
}

await getNearbyVenues('2299 Waters Edge Blvd, Columbus, OH 43209', 160);
