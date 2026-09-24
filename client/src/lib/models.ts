export interface EventVenue {
  id: number;
  name: string | null;
  address: string | null;
  state: string | null;
  country: string | null;
}

export interface EventHost {
  id: number;
  name: string | null;
}

export interface EventInfo {
  id: number;
  date: string | null;
  startTime: string | null;
  eventType: string | null;
  genesys: boolean | null;
  dragonDuels: boolean | null;
  venue: EventVenue;
  host: EventHost;
}
