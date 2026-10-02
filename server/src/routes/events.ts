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

// The venue and host can each be an existing record (`venueId` / `hostId`) or
// a new one the user typed in (`newVenue` / `newHost`). New records are only
// written alongside the event, so abandoning the form never leaves orphans.
const CreateEventBody = z
  .object({
    eventType: z.enum(EventType).nullable().optional(),
    date: z.string().nullable().optional(),
    startTime: z.string().nullable().optional(),
    genesys: z.boolean().nullable().optional(),
    dragonDuels: z.boolean().nullable().optional(),
    venueId: z.coerce.number().int().positive().optional(),
    newVenue: z
      .object({
        name: z.string().trim().min(1),
        address: z.string().trim().min(1),
      })
      .optional(),
    hostId: z.coerce.number().int().positive().optional(),
    newHost: z.object({ name: z.string().trim().min(1) }).optional(),
  })
  .refine((b) => (b.venueId === undefined) !== (b.newVenue === undefined), {
    message: 'Choose an existing venue or enter a new venue name and address.',
  })
  .refine((b) => (b.hostId === undefined) !== (b.newHost === undefined), {
    message: 'Choose an existing host or enter a new host name.',
  });

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const body = parsed.data;

  if (body.venueId !== undefined) {
    if ((await VenueService.getVenueById(body.venueId)) === null) {
      res.status(400).json({ error: 'Selected venue does not exist.' });
      return;
    }
  } else if (
    (await VenueService.getVenueByName(body.newVenue!.name)) !== null
  ) {
    res.status(409).json({ error: 'A venue with that name already exists.' });
    return;
  }

  if (body.hostId !== undefined) {
    if ((await HostService.getHostById(body.hostId)) === null) {
      res.status(400).json({ error: 'Selected host does not exist.' });
      return;
    }
  } else if ((await HostService.getHostByName(body.newHost!.name)) !== null) {
    res.status(409).json({ error: 'A host with that name already exists.' });
    return;
  }

  // Nearby-event search relies on venue.location, so a venue we can't place
  // on the map would never show up in results.
  let newVenue;
  if (body.newVenue !== undefined) {
    const geocoded = await LocationController.geocodeVenueAddress(
      body.newVenue.address
    );
    if (geocoded === undefined) {
      res.status(400).json({ error: "Couldn't find that venue address." });
      return;
    }
    newVenue = { ...body.newVenue, ...geocoded };
  }

  const created = await EventService.createSubmittedEvent({
    event: {
      venueId: body.venueId,
      hostId: body.hostId,
      date: body.date,
      startTime: body.startTime,
      eventType: body.eventType,
      genesys: body.genesys,
      dragonDuels: body.dragonDuels,
      submittedBy: req.user!.id,
    },
    newVenue,
    newHost: body.newHost,
  });
  const event = await EventService.getEventById(created.id);

  res.status(201).json(event);
});

export default router;
