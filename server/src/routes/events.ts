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
  venue: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    state: z.string().min(1).max(2).nullable().optional(),
    country: z.string().min(1).nullable().optional(),
  }),
  host: z.object({
    name: z.string().min(1),
    email: z.string().email().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
  }),
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const body = CreateEventBody.parse(req.body);

  const location = await LocationController.getAddressCoordinates(
    body.venue.address
  );
  if (location === undefined) {
    res.status(400).json({ error: 'Could not find that venue address.' });
    return;
  }

  const venue = await VenueService.upsertScrapedVenue({
    name: body.venue.name,
    address: body.venue.address,
    state: body.venue.state,
    country: body.venue.country,
    location,
  });
  const host = await HostService.upsertScrapedHost({
    name: body.host.name,
    email: body.host.email,
    phoneNumber: body.host.phoneNumber,
  });
  if (venue === null || host === null) {
    res.status(500).json({ error: 'Failed to save venue or host.' });
    return;
  }

  const created = await EventService.createEvent({
    venueId: venue.id,
    hostId: host.id,
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
