import { query } from '../db/index.js';

export class Venue {
  id?: number;
  name: string;
  address?: string;
  state?: string;
  country?: string;
  playerCap?: number;
  constructor(
    name: string,
    address?: string,
    state?: string,
    country?: string,
    playerCap?: number
  ) {
    this.name = name;
    this.address = address;
    this.state = state;
    this.country = country;
    this.playerCap = playerCap;
  }

  setId(id: number) {
    this.id = id;
  }
}

export async function createVenue(venue: Venue): Promise<number> {
  const existingVenue = await findVenueByName(venue.name);
  if (existingVenue.length === 0) {
    const sql =
      'INSERT INTO venues (name, address, state, country, player_cap) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const newVenueId = await query(sql, [
      venue.name,
      venue.address,
      venue.state,
      venue.country,
      venue.playerCap,
    ]);
    // @ts-ignore
    return newVenueId.rows[0]['id'];
  } else {
    // @ts-ignore
    return existingVenue['id'];
  }
}

export async function findVenueByName(name: string) {
  const sql = 'SELECT * FROM venues WHERE venues.name = $1';
  const { rows } = await query(sql, [name]);
  return rows[0] ?? [];
}

export async function findVenueById(id: number) {
  const sql = 'SELECT * FROM venues WHERE venues.id = $1';
  const { rows } = await query(sql, [id]);
  return rows[0] ?? [];
}
