import express, { type Request, type Response } from 'express';
import { VenueService } from '../services/venue.ts';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const venues = await VenueService.getAllVenues();
  res.send(venues);
});

export default router;
