import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getClient } from '../db/index.js';

async function upsertVenues(venues: any[]) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const queryStr = 'INSERT INTO venues (name, address, state, country, player_cap) VALUES ($1, $2, $3, $4, $5) ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, state = EXCLUDED.state, country = EXCLUDED.country, player_cap = EXCLUDED.player_cap RETURNING id';

    venues.forEach(async (venue) => {
      const params = [venue.name, venue.address, venue.state, venue.country, venue.playerCap];
      const res = await client.query(queryStr, params);
    })

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
  }
}

async function upsertHosts(hosts: any[]) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const queryStr = 'INSERT INTO hosts (name, email, phone_number) VALUES ($1, $2, $3) ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone_number = EXCLUDED.phone_number RETURNING id';

    hosts.forEach(async (host) => {
      const params = [host.name, host.email, host.phoneNumber];
      const res = await client.query(queryStr, params);
    })

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
  }
}

/**
 * @param {string} pageUrl 
 * @returns {Promise<any[]>}
 */
async function scrapeInfoFromPage(pageUrl: string){
  const regionalInfo: object[] = [];

  try {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);

    $('table').each((i, table) => {
      const isGenesys = $(table).attr('id')?.includes('gen') ?? false;

      const columns: string[] = [];

      $(table).find('thead th').each((i, el) => {
        columns.push($(el).text().trim());
      });

      $(table).find('tbody tr').each((i, row) => {
        const rowData: { [key: string]: any} = {};
        
        $(row).find('td').each((j, cell) => {
          const columnName = columns[j] || `column_${j}`;
          const rowText = $(cell).text().trim()//.replace(/[\r\n]+/gm, " ");

          if(columnName.match(/Venue\s*(?:\/|&)\s*Address/gm)){
            const rowArray = rowText.split('\n');
            rowData['Venue'] = rowArray[0];
            rowData['Address'] = rowArray.slice(1, rowArray.length).join(' ');
          } 
          else if(columnName === 'Contact'){
            const rowArray = rowText.split('\n');
            rowData['Email'] = rowArray[0];
            rowData['Phone'] = rowArray[1];
          } 
          else if(columnName === 'Date/Time'){
            const rowArray = rowText.split('\n');
            rowData['Date'] = rowArray[0];
            rowData['Start Time'] = rowArray[1];
          } 
          else if (columnName === 'Venue Seating Capacity'){
            // If this value is 0, the event is a remote duel.
            const playerCap = parseInt(rowText);
            rowData['Player Cap'] = isNaN(playerCap) ? 0 : playerCap;
          }
          else {
            rowData[columnName] = rowText;
          }
        });

        rowData['Genesys'] = isGenesys;
        regionalInfo.push(rowData);
      });

    })

    
  } catch (err) {
    console.error(err);
  }

  return regionalInfo;
}

async function scrapeRegionalInfo(){
  const regionals = await scrapeInfoFromPage('https://www.yugioh-card.com/en/events/regional-locations/');

  // Process Hosts
  const hosts = regionals.map((event: { [key: string]: any} ) => {
    return {
      name: event['Event Host'],
      email: event['Email'],
      phoneNumber: event['Phone']
    };
  })
  //await upsertHosts(hosts);
  // Process Venues
  const venues = regionals.map((event: { [key: string]: any} ) => {
    return {
      name: event['Venue'],
      address: event['Address'],
      state: event['State / Province'],
      country: event['Country'],
      playerCap: event['Player Cap']
    };
  })
  //await upsertVenues(venues);
  // Process Events
}

scrapeRegionalInfo();
