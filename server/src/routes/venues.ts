import express, { type Request, type Response } from 'express';
import { getNearbyVenues } from '../repositories/location.ts';
import * as z from 'zod';

const router = express.Router();

const GetCloseVenuesQuery = z.object({
  address: z.string(),
  distance: z.coerce.number().int(),
});

router.get('/', async (req: Request, res: Response) => {
  const data = GetCloseVenuesQuery.parse(req.query);

  const results = await getNearbyVenues(data.address, data.distance);

  res.send(results);
});

export default router;
