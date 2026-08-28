import { query } from '../db/index.js';

export interface VenueCoords {
  lng: number;
  lat: number;
}

export class Venue {
  private _id?: number;
  name: string;
  address: string;
  state?: string;
  country?: string;
  playerCap?: number;
  location?: VenueCoords;

  constructor(
    name: string,
    address: string,
    state?: string,
    country?: string,
    playerCap?: number,
    location?: VenueCoords
  ) {
    this.name = name;
    this.address = address;
    this.state = state;
    this.country = country;
    this.playerCap = playerCap;
    this.location = location;
  }

  static createVenueFromRow(row: any) {
    const venueObj = new Venue(
      row['name'],
      row['address'],
      row['state'],
      row['country'],
      row['player_cap']
    );
    return venueObj;
  }

  public get id() {
    return this._id ?? 0;
  }

  public set id(id: number) {
    this._id = id;
  }
}

export async function createVenue(venue: Venue): Promise<number> {
  let newId: number = 0;
  try {
    const existingVenue = await getVenueByName(venue.name);
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
      newId = newVenueId.rows[0]['id'];
    } else {
      // @ts-ignore
      newId = existingVenue['id'];
    }
  } catch (error) {
    console.log(error);
  }

  return newId;
}

export async function getVenueByName(name: string) {
  const sql = 'SELECT * FROM venues_coords WHERE venues.name = $1';
  const { rows } = await query(sql, [name]);
  return rows[0] ?? [];
}

export async function getVenueById(id: number) {
  const sql = 'SELECT * FROM venues_coords WHERE venues.id = $1';
  const { rows } = await query(sql, [id]);
  return rows[0] ?? [];
}

export async function getAllVenues() {
  const sql = 'SELECT * FROM venues_coords';
  const { rows } = await query(sql);

  const venues: Venue[] = rows.map((row: any) => {
    const coords: VenueCoords = {
      lng: row['lng'],
      lat: row['lat'],
    };
    const newVenue = new Venue(
      row['name'],
      row['address'],
      row['state'],
      row['country'],
      row['player_cap'],
      coords
    );
    newVenue.id = row['id'];
    return newVenue;
  });

  return venues;
}

export async function updateVenue(venue: Venue) {
  const sql =
    'UPDATE venues v SET name = $1, address = $2, state = $3, country = $4, player_cap = $5, location = ST_SetSRID(ST_MakePoint($6, $7), 4326) WHERE v.id = $8';
  const rows = await query(sql, [
    venue.name,
    venue.address,
    venue.state,
    venue.country,
    venue.playerCap,
    venue.location?.lng,
    venue.location?.lat,
    venue.id,
  ]);
}
