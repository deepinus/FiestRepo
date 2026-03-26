const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { booking_id, score, comment } = req.body;

  if (!booking_id || !score) {
    return res.status(400).json({ error: 'booking_id and score are required' });
  }
  if (score < 1 || score > 5) {
    return res.status(400).json({ error: 'score must be between 1 and 5' });
  }

  try {
    const bookingResult = await db.query(`
      SELECT b.*, cl.companion_id
      FROM bookings b
      JOIN companion_listings cl ON b.listing_id = cl.id
      WHERE b.id = $1
    `, [booking_id]);

    if (bookingResult.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = bookingResult.rows[0];

    if (booking.status !== 'paid') return res.status(400).json({ error: 'Can only rate completed (paid) bookings' });

    const isRequester = req.user.id === booking.requester_id;
    const isCompanion = req.user.id === booking.companion_id;

    if (!isRequester && !isCompanion) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existing = await db.query(
      'SELECT id FROM ratings WHERE booking_id = $1 AND rater_id = $2',
      [booking_id, req.user.id]
    );
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Already rated this booking' });

    const ratee_id = isRequester ? booking.companion_id : booking.requester_id;

    await db.query(
      'INSERT INTO ratings (booking_id, rater_id, ratee_id, score, comment) VALUES ($1, $2, $3, $4, $5)',
      [booking_id, req.user.id, ratee_id, score, comment || '']
    );

    res.status(201).json({ message: 'Rating submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.score, r.comment, u.name AS rater_name
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      WHERE r.ratee_id = $1
      ORDER BY r.id DESC
    `, [req.params.userId]);

    const ratings = result.rows;
    const avg = ratings.length > 0
      ? parseFloat((ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1))
      : null;

    res.json({ ratings, avg_rating: avg, count: ratings.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
