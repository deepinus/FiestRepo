const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create a new listing (companion only)
// Also creates the flight entry for the companion
router.post('/', requireAuth, requireRole('companion'), (req, res) => {
  const { flight_number, flight_date, origin, destination, services, price, description } = req.body;

  if (!flight_number || !flight_date || !origin || !destination || !price) {
    return res.status(400).json({ error: 'flight_number, flight_date, origin, destination, price are required' });
  }

  // Create the flight entry for this companion
  const flightResult = db.prepare(
    'INSERT INTO flights (user_id, flight_number, flight_date, origin, destination) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, flight_number.toUpperCase().trim(), flight_date, origin.toUpperCase(), destination.toUpperCase());

  const listingResult = db.prepare(
    'INSERT INTO companion_listings (companion_id, flight_id, services, price, description) VALUES (?, ?, ?, ?, ?)'
  ).run(
    req.user.id,
    flightResult.lastInsertRowid,
    JSON.stringify(Array.isArray(services) ? services : []),
    price,
    description || ''
  );

  res.status(201).json({ id: listingResult.lastInsertRowid });
});

// Get companion's own listings
router.get('/mine', requireAuth, requireRole('companion'), (req, res) => {
  const listings = db.prepare(`
    SELECT cl.*, f.flight_number, f.flight_date, f.origin, f.destination,
      (SELECT COUNT(*) FROM bookings WHERE listing_id = cl.id AND status = 'pending') AS pending_requests
    FROM companion_listings cl
    JOIN flights f ON cl.flight_id = f.id
    WHERE cl.companion_id = ?
    ORDER BY f.flight_date DESC
  `).all(req.user.id);

  res.json(listings.map(l => ({ ...l, services: JSON.parse(l.services || '[]') })));
});

// Get a specific listing detail with companion profile and ratings
router.get('/:listingId', (req, res) => {
  const listing = db.prepare(`
    SELECT
      cl.*,
      f.flight_number, f.flight_date, f.origin, f.destination,
      u.id AS companion_id, u.name AS companion_name, u.bio AS companion_bio,
      u.languages AS companion_languages
    FROM companion_listings cl
    JOIN flights f ON cl.flight_id = f.id
    JOIN users u ON cl.companion_id = u.id
    WHERE cl.id = ?
  `).get(req.params.listingId);

  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const ratings = db.prepare(`
    SELECT r.score, r.comment, u.name AS rater_name
    FROM ratings r
    JOIN users u ON r.rater_id = u.id
    JOIN bookings b ON r.booking_id = b.id
    WHERE r.ratee_id = ? AND b.listing_id = ?
    ORDER BY r.id DESC
  `).all(listing.companion_id, listing.id);

  const avgRating = ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
    : null;

  res.json({
    ...listing,
    services: JSON.parse(listing.services || '[]'),
    companion_languages: JSON.parse(listing.companion_languages || '[]'),
    ratings,
    avg_rating: avgRating ? parseFloat(avgRating) : null,
  });
});

// Update a listing (price, services, status)
router.patch('/:listingId', requireAuth, requireRole('companion'), (req, res) => {
  const listing = db.prepare('SELECT * FROM companion_listings WHERE id = ? AND companion_id = ?')
    .get(req.params.listingId, req.user.id);

  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const { price, services, description, status } = req.body;
  db.prepare(`
    UPDATE companion_listings SET
      price = COALESCE(?, price),
      services = COALESCE(?, services),
      description = COALESCE(?, description),
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(
    price ?? null,
    services ? JSON.stringify(services) : null,
    description ?? null,
    status ?? null,
    listing.id
  );

  res.json({ message: 'Listing updated' });
});

module.exports = router;
