const parseAddress = require('parse-address-string');

function extractVenueAndAddress(input) {
  if (!input || typeof input !== 'string') {
    return { venue: '', address: '' };
  }

  const text = input.trim();

  // Regex to find where a street address likely begins:
  // e.g. "123 Main St", "45B Oak Avenue", "1600 Pennsylvania Ave NW"
  const streetTypes = '(?:st|street|streets|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|ct|court|pl|place|sq|square|hwy|highway|pkwy|parkway|terrace|ter|circle|cir)';
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

function extractEmailAndPhone(input) {
  if (!input || typeof input !== 'string') {
    return { email: '', phone: '' };
  }

  const text = input.trim();

  // --- Email pattern ---
  // Standard email format: local-part@domain.tld
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

  // --- Phone pattern ---
  // Matches common US/international formats:
  // (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890,
  // +1 123-456-7890, +44 20 7946 0958, with optional extension
  const phoneRegex = /(\+?\d{1,3}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}(\s?(ext|x|extension)\.?\s?\d{1,5})?/i;

  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0].trim() : '';

  // Remove the email from text before searching for phone,
  // to avoid accidentally matching digits within an email/domain
  const textWithoutEmail = email ? text.replace(email, '') : text;

  const phoneMatch = textWithoutEmail.match(phoneRegex);
  let phone = phoneMatch ? phoneMatch[0].trim() : '';

  // Clean up stray punctuation/whitespace at edges
  phone = phone.replace(/^[\s,;:-]+|[\s,;:-]+$/g, '');

  return { email, phone };
}

function extractEventDateTime(input){
  if (!input || typeof input !== 'string') {
    return { date: '', time: '' };
  }
  const eventInstant = Temporal.Instant.from(new Date(input.trim()).toISOString());
  const eventNormalized = Temporal.PlainDateTime.from(eventInstant.toZonedDateTimeISO('America/New_York'));

  const date = eventNormalized.toPlainDate().toString();
  const time = eventNormalized.toPlainTime().toString();
  
  return { date, time };
}

module.exports = {
  extractVenueAndAddress,
  extractEmailAndPhone,
  extractEventDateTime
}