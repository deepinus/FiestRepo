const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Register a flight
router.post('/', requireAuth, (req, res) => {
  const { flight_number, flight_date, origin, destination } = req.body;
  if (!flight_number || !flight_date || !origin || !destination) {
    return res.status(400).json({ error: 'flight_number, flight_date, origin, destination are required' });
  }

  const result = db.prepare(
    'INSERT INTO flights (user_id, flight_number, flight_date, origin, destination) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, flight_number.toUpperCase().trim(), flight_date, origin.toUpperCase(), destination.toUpperCase());

  res.status(201).json({ id: result.lastInsertRowid, flight_number, flight_date, origin, destination });
});

// Search flights by flight_number + flight_date → returns active companion listings
router.get('/search', (req, res) => {
  const { flight_number, flight_date } = req.query;
  if (!flight_number || !flight_date) {
    return res.status(400).json({ error: 'flight_number and flight_date are required' });
  }

  const listings = db.prepare(`
    SELECT
      cl.id AS listing_id,
      cl.price,
      cl.services,
      cl.description,
      cl.status,
      f.flight_number,
      f.flight_date,
      f.origin,
      f.destination,
      u.id AS companion_id,
      u.name AS companion_name,
      u.languages AS companion_languages,
      u.bio AS companion_bio,
      ROUND(AVG(r.score), 1) AS avg_rating,
      COUNT(r.id) AS rating_count
    FROM companion_listings cl
    JOIN flights f ON cl.flight_id = f.id
    JOIN users u ON cl.companion_id = u.id
    LEFT JOIN bookings b ON b.listing_id = cl.id
    LEFT JOIN ratings r ON r.booking_id = b.id AND r.ratee_id = u.id
    WHERE f.flight_number = ? AND f.flight_date = ? AND cl.status = 'active'
    GROUP BY cl.id
    ORDER BY avg_rating DESC
  `).all(flight_number.toUpperCase().trim(), flight_date);

  const parsed = listings.map(l => ({
    ...l,
    services: JSON.parse(l.services || '[]'),
    companion_languages: JSON.parse(l.companion_languages || '[]'),
  }));

  res.json(parsed);
});

module.exports = router;
