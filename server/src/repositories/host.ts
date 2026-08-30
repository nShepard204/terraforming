import { Host } from '../entities/host.ts';
import { AppDataSource } from '../db/data-source.ts';

export const hostRepository = AppDataSource.getRepository(Host);
