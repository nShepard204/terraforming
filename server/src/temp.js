import axios from "axios";
import * as cheerio from 'cheerio';
import 'dotenv/config';

import utils from "./utils.js";

async function scrapeRegionalPage(){
  const regionalInfo = [];

  try {
    const { data } = await axios.get('https://www.yugioh-card.com/en/events/regional-locations/');
    const $ = cheerio.load(data);

    const columns = [];
    $('table thead th').each((i, el) => {
      columns.push($(el).text().trim());
    });

    $('table tbody tr').each((i, row) => {
      const rowData = {};
      
      $(row).find('td').each((j, cell) => {
        const columnName = columns[j] || `column_${j}`;
        const rowText = $(cell).text().trim().replace(/[\r\n]+/gm, " ");

        if(columnName === 'Venue/Address'){
          const { venue, address } = utils.extractVenueAndAddress(rowText);
          rowData['Venue'] = venue;
          rowData['Address'] = address
        } 
        else {
          rowData[columnName] = rowText;
        }

        //rowData[columnName] = rowText;
      });
      
      regionalInfo.push(rowData);
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


const eventInfoRegional = await scrapeRegionalPage();
const cbusRegional = eventInfoRegional.filter(events => events['State / Province'] === 'OH')[0];
console.log(new Date(cbusRegional['Date/Time']).toTimeString());
//console.log(await getLatLongData(cbusRegional['Venue/Address']));
//console.log(await getRouteInfo('2299 Waters Edge Blvd Columbus, OH 43209', cbusRegional['Venue/Address']));
//const coords = await getLatLongData(cbusRegional['Venue/Address']);
//await getVenueInfo(coords.lng, coords.lat);