require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const utils = require('../src/utils');
const mapbox = require('../src/mapbox');
const db = require('../db');

//TODO: Add timezone fetching to this.
async function upsertVenues(regionals) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const queryStr = 'INSERT INTO venues (name, street_address, state, country, player_cap, location) VALUES ($1, $2, $3, $4, $5, ST_MakePoint($6, $7)) ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name, street_address = EXCLUDED.street_address, state = EXCLUDED.state, country = EXCLUDED.country, player_cap = EXCLUDED.player_cap, location = EXCLUDED.location RETURNING id';

    regionals.forEach(async (event) => {
      const { lng, lat } = await mapbox.getLatLonData(event['Address']);
      const params = [event['Venue'], event['Address'], event['State / Province'], event['Country'], event['Venue Seating Capacity'] || 0, lng, lat];
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

async function upsertHosts(regionals) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const queryStr = 'INSERT INTO hosts (name, email, phone_number) VALUES ($1, $2, $3) ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone_number = EXCLUDED.phone_number RETURNING id';

    regionals.forEach(async (event) => {
      const params = [event['Event Host'], event['Email'], event['Phone']];
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

async function scrapeInfoFromPage(pageUrl){
  const regionalInfo = [];

  try {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);

    $('table').each((i, table) => {
      const isGenesys = $(table).attr('id').includes('gen');

      const columns = [];
      $(table).find('thead th').each((i, el) => {
        columns.push($(el).text().trim());
      });

      $(table).find('tbody tr').each((i, row) => {
        const rowData = {};
        
        $(row).find('td').each((j, cell) => {
          const columnName = columns[j] || `column_${j}`;
          const rowText = $(cell).text().trim().replace(/[\r\n]+/gm, " ");

          if(columnName.includes('Venue') && columnName.includes('Address')){
            const { venue, address } = utils.extractVenueAndAddress(rowText);
            rowData['Venue'] = venue;
            rowData['Address'] = address;
          } 
          else if(columnName === 'Contact'){
            const { email, phone } = utils.extractEmailAndPhone(rowText);
            rowData['Email'] = email;
            rowData['Phone'] = phone;
          } 
          else if(columnName === 'Date/Time'){
            const { date, time } = utils.extractEventDateTime(rowText);
            rowData['Date'] = date;
            rowData['Start Time'] = time;
          } 
          else {
            rowData[columnName] = rowText;
          }
        });
        rowData['Genesys'] = isGenesys;
        regionalInfo.push(rowData);
      });
    });
  } catch (err) {
    console.error(err);
  }

  return regionalInfo;
}

async function scrapeRegionalInfo(){
  const regionals = await scrapeInfoFromPage('https://www.yugioh-card.com/en/events/regional-locations/');

  //console.log(regionals.filter((event) => event['Venue'] === undefined).length)

  regionals.forEach((event) => {
    console.log(event['Address'])
  })

  // Process Hosts
  //await upsertHosts(regionals);
  // Process Venues
  //await upsertVenues(regionals);
  // Process Events
}

scrapeRegionalInfo();

module.exports = {
  scrapeRegionalInfo,
}