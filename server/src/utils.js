function extractVenueAndAddress(input) {
  if (!input || typeof input !== 'string') {
    return { venue: '', address: '' };
  }

  const text = input.trim();

  // Regex to find where a street address likely begins:
  // e.g. "123 Main St", "45B Oak Avenue", "1600 Pennsylvania Ave NW"
  const streetTypes = '(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|ct|court|pl|place|sq|square|hwy|highway|pkwy|parkway|terrace|ter|circle|cir)';
  const addressStartRegex = new RegExp(
    `\\b\\d+[a-zA-Z]?\\s+([A-Za-z0-9.'-]+\\s+){0,4}${streetTypes}\\b`,
    'i'
  );

  const match = text.match(addressStartRegex);

  let venue = '';
  let address = '';

  if (match) {
    const idx = match.index;
    venue = text.slice(0, idx).trim();
    address = text.slice(idx).trim();
  } else {
    // Fallback: split on common separators like " - ", ",", or "|"
    const separators = /\s*[-–|]\s*|,\s*/;
    const parts = text.split(separators);

    if (parts.length > 1) {
      venue = parts[0].trim();
      address = parts.slice(1).join(', ').trim();
    } else {
      // No clear separator or street pattern found
      venue = text;
      address = '';
    }
  }

  // Clean up trailing/leading punctuation
  venue = venue.replace(/^[,\-–|\s]+|[,\-–|\s]+$/g, '');
  address = address.replace(/^[,\-–|\s]+|[,\-–|\s]+$/g, '');

  return { venue, address };
}

function extractEventDateTime(dateTimeStr){
  
}

export default {
  extractVenueAndAddress
}