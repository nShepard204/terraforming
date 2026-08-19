import { query } from '../db/index.js';

export class Host {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  constructor(hostName: string, hostEmail?: string, hostPhone?: string) {
    this.name = hostName;
    this.email = hostEmail ?? 'N/A';
    this.phone = hostPhone ?? 'N/A';
  }

  setId(id: number) {
    this.id = id;
  }
}

export async function createHost(host: Host): Promise<number> {
  const existingHost = await findHostByName(host.name);
  if (existingHost.length === 0) {
    const sql =
      'INSERT INTO hosts (name, email, phone_number) VALUES ($1, $2, $3) RETURNING id';
    const newHostId = await query(sql, [host.name, host.email, host.phone]);
    // @ts-ignore
    return newHostId.rows[0]['id'];
  } else {
    // @ts-ignore
    return existingHost['id'];
  }
}

export async function findHostByName(name: string) {
  const sql = 'SELECT * FROM hosts WHERE hosts.name = $1';
  const { rows } = await query(sql, [name]);
  return rows[0] ?? [];
}

export async function findHostById(id: number) {
  const sql = 'SELECT * FROM hosts WHERE hosts.id = $1';
  const { rows } = await query(sql, [id]);
  return rows[0] ?? [];
}
