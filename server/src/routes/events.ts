import express, { type Request, type Response } from 'express';
import { LocationController } from '../controllers/location.ts';
import { EventType } from '../entities/event.ts';
import { EventService } from '../services/event.ts';
import { VenueService } from '../services/venue.ts';
import { HostService } from '../services/host.ts';
import { requireAuth } from '../middleware/auth.ts';
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

const CreateEventBody = z.object({
  eventType: z.nativeEnum(EventType).nullable().optional(),
  date: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  genesys: z.boolean().nullable().optional(),
  dragonDuels: z.boolean().nullable().optional(),
  venueId: z.coerce.number().int().positive(),
  hostId: z.coerce.number().int().positive(),
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const body = CreateEventBody.parse(req.body);

  const [venue, host] = await Promise.all([
    VenueService.getVenueById(body.venueId),
    HostService.getHostById(body.hostId),
  ]);
  if (venue === null) {
    res.status(400).json({ error: 'Selected venue does not exist.' });
    return;
  }
  if (host === null) {
    res.status(400).json({ error: 'Selected host does not exist.' });
    return;
  }

  const created = await EventService.createEvent({
    venueId: body.venueId,
    hostId: body.hostId,
    date: body.date,
    startTime: body.startTime,
    eventType: body.eventType,
    genesys: body.genesys,
    dragonDuels: body.dragonDuels,
    submittedBy: req.user!.id,
  });
  const event = await EventService.getEventById(created.id);

  res.status(201).json(event);
});

export default router;
