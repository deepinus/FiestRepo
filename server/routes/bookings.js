const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { listing_id, traveler_name, traveler_needs } = req.body;

  if (!listing_id || !traveler_name) {
    return res.status(400).json({ error: 'listing_id and traveler_name are required' });
  }

  try {
    const listingResult = await db.query(
      "SELECT * FROM companion_listings WHERE id = $1 AND status = 'active'",
      [listing_id]
    );
    if (listingResult.rows.length === 0) return res.status(404).json({ error: 'Listing not found or inactive' });

    const listing = listingResult.rows[0];
    if (listing.companion_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot book your own listing' });
    }

    const result = await db.query(
      'INSERT INTO bookings (listing_id, requester_id, traveler_name, traveler_needs) VALUES ($1, $2, $3, $4) RETURNING id',
      [listing_id, req.user.id, traveler_name, traveler_needs || '']
    );

    res.status(201).json({ id: result.rows[0].id, status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'traveler') {
      result = await db.query(`
        SELECT b.*, cl.price, cl.services,
          f.flight_number, f.flight_date, f.origin, f.destination,
          u.name AS companion_name, u.id AS companion_id
        FROM bookings b
        JOIN companion_listings cl ON b.listing_id = cl.id
        JOIN flights f ON cl.flight_id = f.id
        JOIN users u ON cl.companion_id = u.id
        WHERE b.requester_id = $1
        ORDER BY b.created_at DESC
      `, [req.user.id]);
    } else {
      result = await db.query(`
        SELECT b.*, cl.price, cl.services,
          f.flight_number, f.flight_date, f.origin, f.destination,
          u.name AS requester_name, u.id AS requester_id
        FROM bookings b
        JOIN companion_listings cl ON b.listing_id = cl.id
        JOIN flights f ON cl.flight_id = f.id
        JOIN users u ON b.requester_id = u.id
        WHERE cl.companion_id = $1
        ORDER BY b.created_at DESC
      `, [req.user.id]);
    }

    res.json(result.rows.map(b => ({ ...b, services: JSON.parse(b.services || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status, payment_confirmed } = req.body;

  try {
    const bookingResult = await db.query(`
      SELECT b.*, cl.companion_id
      FROM bookings b
      JOIN companion_listings cl ON b.listing_id = cl.id
      WHERE b.id = $1
    `, [req.params.id]);

    if (bookingResult.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = bookingResult.rows[0];

    const isCompanion = req.user.id === booking.companion_id;
    const isRequester = req.user.id === booking.requester_id;

    if (!isCompanion && !isRequester) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (isCompanion && ['accepted', 'declined'].includes(status)) {
      await db.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, booking.id]);
      return res.json({ message: `Booking ${status}` });
    }

    if (isRequester && payment_confirmed && booking.status === 'accepted') {
      await db.query("UPDATE bookings SET status = 'paid', payment_confirmed = 1 WHERE id = $1", [booking.id]);
      return res.json({ message: 'Payment confirmed' });
    }

    res.status(400).json({ error: 'Invalid status transition' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
