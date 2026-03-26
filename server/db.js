require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('traveler', 'companion')),
      bio TEXT DEFAULT '',
      languages TEXT DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS flights (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      flight_number TEXT NOT NULL,
      flight_date TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companion_listings (
      id SERIAL PRIMARY KEY,
      companion_id INTEGER NOT NULL REFERENCES users(id),
      flight_id INTEGER NOT NULL REFERENCES flights(id),
      services TEXT DEFAULT '[]',
      price NUMERIC NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL REFERENCES companion_listings(id),
      requester_id INTEGER NOT NULL REFERENCES users(id),
      traveler_name TEXT NOT NULL,
      traveler_needs TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'paid')),
      payment_confirmed INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES bookings(id),
      rater_id INTEGER NOT NULL REFERENCES users(id),
      ratee_id INTEGER NOT NULL REFERENCES users(id),
      score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
      comment TEXT DEFAULT ''
    );
  `);
}

initDb().catch(err => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});

module.exports = pool;
