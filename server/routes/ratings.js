const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Submit a rating after a completed (paid) booking
router.post('/', requireAuth, (req, res) => {
  const { booking_id, score, comment } = req.body;

  if (!booking_id || !score) {
    return res.status(400).json({ error: 'booking_id and score are required' });
  }
  if (score < 1 || score > 5) {
    return res.status(400).json({ error: 'score must be between 1 and 5' });
  }

  const booking = db.prepare(`
    SELECT b.*, cl.companion_id
    FROM bookings b
    JOIN companion_listings cl ON b.listing_id = cl.id
    WHERE b.id = ?
  `).get(booking_id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'paid') return res.status(400).json({ error: 'Can only rate completed (paid) bookings' });

  const isRequester = req.user.id === booking.requester_id;
  const isCompanion = req.user.id === booking.companion_id;

  if (!isRequester && !isCompanion) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Prevent duplicate ratings
  const existing = db.prepare('SELECT id FROM ratings WHERE booking_id = ? AND rater_id = ?')
    .get(booking_id, req.user.id);
  if (existing) return res.status(409).json({ error: 'Already rated this booking' });

  const ratee_id = isRequester ? booking.companion_id : booking.requester_id;

  db.prepare('INSERT INTO ratings (booking_id, rater_id, ratee_id, score, comment) VALUES (?, ?, ?, ?, ?)')
    .run(booking_id, req.user.id, ratee_id, score, comment || '');

  res.status(201).json({ message: 'Rating submitted' });
});

// Get ratings for a user
router.get('/user/:userId', (req, res) => {
  const ratings = db.prepare(`
    SELECT r.score, r.comment, u.name AS rater_name
    FROM ratings r
    JOIN users u ON r.rater_id = u.id
    WHERE r.ratee_id = ?
    ORDER BY r.id DESC
  `).all(req.params.userId);

  const avg = ratings.length > 0
    ? parseFloat((ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1))
    : null;

  res.json({ ratings, avg_rating: avg, count: ratings.length });
});

module.exports = router;
