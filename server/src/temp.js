const axios = require('axios');
const cheerio = require('cheerio');
const utils = require('./utils');
const hosts = require('./hosts');
const db = require('../db');


async function scrapeRegionalPage(){
  const regionalInfo = [];

  try {
    const { data } = await axios.get('https://www.yugioh-card.com/en/events/regional-locations/');
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

          if(columnName === 'Venue/Address'){
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

async function getLatLongData(address){
  try {
    const requestUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${address}&types=address&access_token=${process.env.MAPBOX_API_KEY}`

    const { data } = await axios.get(requestUrl);
    const { longitude, latitude } = data.features[0].properties.coordinates;
    return { lng: longitude, lat: latitude };
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

async function getRouteInfo(startAddr, endAddr){
  try {
    const start = await getLatLongData(startAddr);
    const end = await getLatLongData(endAddr);

    const requestUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}`;

    const { data } = await axios.get(requestUrl, {
      params: {
        alternatives: 'true',
        access_token: process.env.MAPBOX_API_KEY
      }
    });

    return data;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

async function getVenueInfo(lng, lat){
    
}

async function test(){
  const eventInfoRegional = await scrapeRegionalPage();
  console.log(eventInfoRegional[0]);

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const queryStr = 'INSERT INTO hosts (name, email, phone_number) VALUES ($1, $2, $3) ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone_number = EXCLUDED.phone_number RETURNING id';

    eventInfoRegional.forEach(async (event) => {
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

test();
