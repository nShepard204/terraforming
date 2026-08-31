import express, { type Request, type Response } from 'express';
import { LocationController } from '../controllers/location.ts';
import * as z from 'zod';

const router = express.Router();

const GetNearbyEventsQuery = z.object({
  address: z.string(),
  distance: z.coerce.number().positive(),
});

router.get('/search-nearby', async (req: Request, res: Response) => {
  const { address, distance } = GetNearbyEventsQuery.parse(req.query);

  const events = await LocationController.getNearbyEvents(address, distance);

  res.send(events);
});

export default router;
