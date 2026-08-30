import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppDataSource } from '../db/data-source.ts';

import { Event } from '../entities/event.ts';
import { EventService } from '../services/event.ts';
import { Host } from '../entities/host.ts';
import { HostService } from '../services/host.ts';
import { Venue } from '../entities/venue.ts';

// async function scrapeInfoFromPage(pageUrl: string) {
//   const regionalInfo: object[] = [];

//   try {
//     const { data } = await axios.get(pageUrl);
//     const $ = cheerio.load(data);

//     $('table').each((i, table) => {
//       const isGenesys = $(table).attr('id')?.includes('gen') ?? false;

//       const columns: string[] = [];

//       $(table)
//         .find('thead th')
//         .each((_, el) => {
//           columns.push($(el).text().trim());
//         });

//       $(table)
//         .find('tbody tr')
//         .each((_, row) => {
//           const rowData: { [key: string]: any } = {};

//           $(row)
//             .find('td')
//             .each((j, cell) => {
//               const columnName = columns[j] || `column_${j}`;
//               const rowText = $(cell).text().trim(); //.replace(/[\r\n]+/gm, " ");

//               if (columnName.match(/Venue\s*(?:\/|&)\s*Address/gm)) {
//                 const rowArray = rowText.split('\n');
//                 rowData['Venue'] = rowArray[0];
//                 rowData['Address'] = rowArray
//                   .slice(1, rowArray.length)
//                   .join(' ');
//               } else if (columnName === 'Contact') {
//                 const rowArray = rowText.split('\n');
//                 rowData['Email'] = rowArray[0];
//                 rowData['Phone'] = rowArray[1];
//               } else if (columnName === 'Date/Time') {
//                 const rowArray = rowText.split('\n');
//                 rowData['Date'] = rowArray[0];
//                 rowData['Start Time'] = rowArray[1];
//               } else if (columnName === 'Venue Seating Capacity') {
//                 // If this value is 0, the event is a remote duel.
//                 const playerCap = parseInt(rowText);
//                 rowData['Player Cap'] = isNaN(playerCap) ? 0 : playerCap;
//               } else {
//                 rowData[columnName] = rowText;
//               }
//             });

//           rowData['Genesys'] = isGenesys;
//           regionalInfo.push(rowData);
//         });
//     });
//   } catch (err) {
//     console.error(err);
//   }

//   return regionalInfo;
// }

// async function scrapEvents() {
//   const scrapedEvents = await scrapeInfoFromPage(
//     'https://www.yugioh-card.com/en/events/regional-locations/'
//   );
//   const extractedHosts: Host[] = [];
//   const extractedVenues: Venue[] = [];
//   const extractedEvents: Event[] = [];

//   // Process Hosts & Venues
//   console.log('Extracting hosts and venues...');
//   scrapedEvents.forEach((event: { [key: string]: any }) => {
//     extractedHosts.push(
//       new Host(event['Event Host'], event['Email'], event['Phone'])
//     );

//     extractedVenues.push(
//       new Venue(
//         event['Venue'],
//         event['Address'],
//         event['State / Province'],
//         event['Country'],
//         event['Player Cap']
//       )
//     );
//   });

//   console.log('Inserting hosts...');
//   for (const host of extractedHosts) {
//     const id = await createHost(host);
//     if (id !== undefined) {
//       host.id = id;
//     }
//   }
//   const hosts = extractedHosts.filter((host) => host.id !== undefined);

//   console.log('Inserting venues...');
//   for (const venue of extractedVenues) {
//     const id = await createVenue(venue);
//     if (id !== undefined) {
//       venue.id = id;
//     }
//   }
//   const venues = extractedVenues.filter((venue) => venue.id !== undefined);

//   console.log('Extracting events...');
//   scrapedEvents.forEach((eventInfo: { [key: string]: any }) => {
//     const hostId = hosts.filter(
//       (host) => host.name === eventInfo['Event Host']
//     )[0].id;

//     const venueId = venues.filter(
//       (venue) => venue.name === eventInfo['Venue']
//     )[0].id;

//     if (hostId === undefined || venueId === undefined) {
//       console.log('Error Inserting Event; Couldnt find host or venue');
//       return;
//     }

//     const event = new Event(
//       venueId,
//       hostId,
//       eventInfo['Date'],
//       eventInfo['Start Time'],
//       eventInfo['Genesys'],
//       eventInfo['Dragon Duel']
//     );
//     extractedEvents.push(event);
//   });

//   console.log('Inserting events...');
//   for (const event of extractedEvents) {
//     const id = await createEvent(event);
//     if (id !== undefined) {
//       event.id = id;
//     }
//   }
// }

async function test() {
  await AppDataSource.initialize();
  await HostService.createHost({
    name: 'Millennium Games',
    email: 'aj@millenniumgames.com',
    phoneNumber: '585-427-2190',
  });
}

await test();

//scrapEvents();
