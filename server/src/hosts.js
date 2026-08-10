require('dotenv').config();

const pg = require('pg');
const { Pool } = pg;

async function upsertHost({ name, email, phoneNumber }){

  try {

    console.log('Connection established');

    const newHost = await sql`
      INSERT INTO hosts (name, email, phone_number)
      VALUES (${name}, ${email}, ${phoneNumber})
      ON CONFLICT(name)
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone_number = EXCLUDED.phone_number
      RETURNING id;
    `;
    return newHost[0]['id'];
  } catch (err) {
    console.error('Connection failed.', err);
    return 0;
  }
}

module.exports = {
  upsertHost
}