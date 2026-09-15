import { decodeProtectedHeader, importJWK, jwtVerify, type CryptoKey } from 'jose';
import { AppDataSource } from '../db/data-source.ts';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

interface JwksRow {
  publicKey: string;
}

// Neon Auth (Better Auth)'s JWT plugin issues a session JWT signed with a
// key it stores directly in this same database (neon_auth.jwks), keyed by
// the JWT's `kid` header. Verifying against that key locally means an
// authenticated request never needs a network round trip to the auth
// server, and forging a token requires the private key from our own
// database rather than anything an outside party could obtain.
const publicKeyCache = new Map<string, CryptoKey>();

export class AuthService {
  static async getUserFromToken(token: string): Promise<AuthenticatedUser | null> {
    let kid: string | undefined;
    try {
      ({ kid } = decodeProtectedHeader(token));
    } catch {
      return null;
    }
    if (!kid) return null;

    const key = await this.getPublicKey(kid);
    if (!key) return null;

    try {
      const { payload } = await jwtVerify(token, key);
      if (
        typeof payload.sub !== 'string' ||
        typeof payload.name !== 'string' ||
        typeof payload.email !== 'string'
      ) {
        return null;
      }
      return { id: payload.sub, name: payload.name, email: payload.email };
    } catch {
      return null;
    }
  }

  private static async getPublicKey(kid: string): Promise<CryptoKey | null> {
    const cached = publicKeyCache.get(kid);
    if (cached) return cached;

    const rows: JwksRow[] = await AppDataSource.query(
      'SELECT "publicKey" FROM neon_auth.jwks WHERE id = $1',
      [kid]
    );
    if (rows.length === 0) return null;

    const key = (await importJWK(
      JSON.parse(rows[0].publicKey),
      'EdDSA'
    )) as CryptoKey;
    publicKeyCache.set(kid, key);
    return key;
  }
}
