const path = require('path');
const axios = require('axios');
const { SearchBoxCore, SessionToken } = require('@mapbox/search-js-core');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function searchVenue(addressStr){
  const search = new SearchBoxCore({ accessToken: process.env.MAPBOX_API_KEY });
  const sessionToken = new SessionToken();

  const result = await search.suggest(addressStr, { sessionToken });
  if (result.suggestions.length === 0) return;

  const suggestion = result.suggestions[0];
  const { features } = await search.retrieve(suggestion, { sessionToken });
  console.log(features[0].properties.name);
  console.log(features[0].properties.full_address);
  console.log();
}

async function getLatLonData(address){
  if (!address || typeof address !== 'string') {
    return { lng: 0.000000, lat: 0.000000 };
  }

  try {
    const requestUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${address}&types=address&access_token=${process.env.MAPBOX_API_KEY}`

    const { data } = await axios.get(requestUrl);
    const { longitude, latitude } = data.features[0].properties.coordinates;
    return { lng: longitude || 0.000000, lat: latitude || 0.000000 };
  } catch (err) {
    console.error(err);
    return { lng: 0.000000, lat: 0.000000 };
  }
}

module.exports = {
  getLatLonData,
  searchVenue
}