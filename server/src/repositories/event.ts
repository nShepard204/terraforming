import { query } from '../db/index.js';

export class Event {
  id?: number;
  venueId: number;
  hostId: number;
  date?: string; // TODO: Change to temporal support??
  startTime?: string;
  genesys?: boolean;
  dragonDuel?: boolean;
  constructor(
    venueId: number,
    hostId: number,
    date?: string,
    startTime?: string,
    genesys?: boolean,
    dragonDuel?: boolean
  ) {
    this.venueId = venueId;
    this.hostId = hostId;
    this.date = date;
    this.startTime = startTime;
    this.genesys = genesys;
    this.dragonDuel = dragonDuel;
  }

  setId(id: number) {
    this.id = id;
  }
}

export async function createEvent(event: Event) {
  const existingEvent = await findEventByClues(event);
  if (existingEvent.length === 0) {
    const sql =
      'INSERT INTO events (venue_id, host_id, date, start_time, genesys, dragon_duels) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
    const newHostId = await query(sql, [
      event.venueId,
      event.hostId,
      event.date,
      event.startTime,
      event.genesys,
      event.dragonDuel,
    ]);
    // @ts-ignore
    return newHostId.rows[0]['id'];
  }
  return undefined;
}

export async function findEventByClues(event: Event) {
  const sql =
    'SELECT * FROM events WHERE events.venue_id = $1 AND events.host_id = $2 AND events.genesys = $3 AND events.date = $4';
  const { rows } = await query(sql, [
    event.venueId,
    event.hostId,
    event.genesys,
    event.date,
  ]);
  console.log(rows);
  return rows[0] ?? [];
}

export async function findEventById(id: number) {
  const sql = 'SELECT * FROM events WHERE events.id = $1';
  const { rows } = await query(sql, [id]);
  return rows[0] ?? [];
}
