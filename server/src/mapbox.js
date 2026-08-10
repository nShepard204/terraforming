require('dotenv').config();
const axios = require('axios');

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
  getLatLonData
}