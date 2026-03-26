const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, requireRole('companion'), async (req, res) => {
  const { flight_number, flight_date, origin, destination, services, price, description } = req.body;

  if (!flight_number || !flight_date || !origin || !destination || !price) {
    return res.status(400).json({ error: 'flight_number, flight_date, origin, destination, price are required' });
  }

  try {
    const flightResult = await db.query(
      'INSERT INTO flights (user_id, flight_number, flight_date, origin, destination) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, flight_number.toUpperCase().trim(), flight_date, origin.toUpperCase(), destination.toUpperCase()]
    );

    const listingResult = await db.query(
      'INSERT INTO companion_listings (companion_id, flight_id, services, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, flightResult.rows[0].id, JSON.stringify(Array.isArray(services) ? services : []), price, description || '']
    );

    res.status(201).json({ id: listingResult.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', requireAuth, requireRole('companion'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT cl.*, f.flight_number, f.flight_date, f.origin, f.destination,
        (SELECT COUNT(*) FROM bookings WHERE listing_id = cl.id AND status = 'pending') AS pending_requests
      FROM companion_listings cl
      JOIN flights f ON cl.flight_id = f.id
      WHERE cl.companion_id = $1
      ORDER BY f.flight_date DESC
    `, [req.user.id]);

    res.json(result.rows.map(l => ({ ...l, services: JSON.parse(l.services || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:listingId', async (req, res) => {
  try {
    const listingResult = await db.query(`
      SELECT
        cl.*,
        f.flight_number, f.flight_date, f.origin, f.destination,
        u.id AS companion_id, u.name AS companion_name, u.bio AS companion_bio,
        u.languages AS companion_languages
      FROM companion_listings cl
      JOIN flights f ON cl.flight_id = f.id
      JOIN users u ON cl.companion_id = u.id
      WHERE cl.id = $1
    `, [req.params.listingId]);

    if (listingResult.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    const listing = listingResult.rows[0];

    const ratingsResult = await db.query(`
      SELECT r.score, r.comment, u.name AS rater_name
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.ratee_id = $1 AND b.listing_id = $2
      ORDER BY r.id DESC
    `, [listing.companion_id, listing.id]);

    const ratings = ratingsResult.rows;
    const avgRating = ratings.length > 0
      ? parseFloat((ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1))
      : null;

    res.json({
      ...listing,
      services: JSON.parse(listing.services || '[]'),
      companion_languages: JSON.parse(listing.companion_languages || '[]'),
      ratings,
      avg_rating: avgRating,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:listingId', requireAuth, requireRole('companion'), async (req, res) => {
  try {
    const listingResult = await db.query(
      'SELECT * FROM companion_listings WHERE id = $1 AND companion_id = $2',
      [req.params.listingId, req.user.id]
    );
    if (listingResult.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });

    const { price, services, description, status } = req.body;
    await db.query(`
      UPDATE companion_listings SET
        price = COALESCE($1, price),
        services = COALESCE($2, services),
        description = COALESCE($3, description),
        status = COALESCE($4, status)
      WHERE id = $5
    `, [
      price ?? null,
      services ? JSON.stringify(services) : null,
      description ?? null,
      status ?? null,
      listingResult.rows[0].id
    ]);

    res.json({ message: 'Listing updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
