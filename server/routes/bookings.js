const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Request a companion (create a booking)
router.post('/', requireAuth, (req, res) => {
  const { listing_id, traveler_name, traveler_needs } = req.body;

  if (!listing_id || !traveler_name) {
    return res.status(400).json({ error: 'listing_id and traveler_name are required' });
  }

  const listing = db.prepare('SELECT * FROM companion_listings WHERE id = ? AND status = ?')
    .get(listing_id, 'active');

  if (!listing) return res.status(404).json({ error: 'Listing not found or inactive' });

  if (listing.companion_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot book your own listing' });
  }

  const result = db.prepare(
    'INSERT INTO bookings (listing_id, requester_id, traveler_name, traveler_needs) VALUES (?, ?, ?, ?)'
  ).run(listing_id, req.user.id, traveler_name, traveler_needs || '');

  res.status(201).json({ id: result.lastInsertRowid, status: 'pending' });
});

// Get own bookings (traveler sees their requests; companion sees requests on their listings)
router.get('/mine', requireAuth, (req, res) => {
  let bookings;
  if (req.user.role === 'traveler') {
    bookings = db.prepare(`
      SELECT b.*, cl.price, cl.services,
        f.flight_number, f.flight_date, f.origin, f.destination,
        u.name AS companion_name, u.id AS companion_id
      FROM bookings b
      JOIN companion_listings cl ON b.listing_id = cl.id
      JOIN flights f ON cl.flight_id = f.id
      JOIN users u ON cl.companion_id = u.id
      WHERE b.requester_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
  } else {
    bookings = db.prepare(`
      SELECT b.*, cl.price, cl.services,
        f.flight_number, f.flight_date, f.origin, f.destination,
        u.name AS requester_name, u.id AS requester_id
      FROM bookings b
      JOIN companion_listings cl ON b.listing_id = cl.id
      JOIN flights f ON cl.flight_id = f.id
      JOIN users u ON b.requester_id = u.id
      WHERE cl.companion_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
  }

  res.json(bookings.map(b => ({ ...b, services: JSON.parse(b.services || '[]') })));
});

// Update booking status (companion accepts/declines; traveler confirms payment)
router.patch('/:id/status', requireAuth, (req, res) => {
  const { status, payment_confirmed } = req.body;

  const booking = db.prepare(`
    SELECT b.*, cl.companion_id
    FROM bookings b
    JOIN companion_listings cl ON b.listing_id = cl.id
    WHERE b.id = ?
  `).get(req.params.id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const isCompanion = req.user.id === booking.companion_id;
  const isRequester = req.user.id === booking.requester_id;

  if (!isCompanion && !isRequester) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Companions can accept/decline
  if (isCompanion && ['accepted', 'declined'].includes(status)) {
    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, booking.id);
    return res.json({ message: `Booking ${status}` });
  }

  // Requester can confirm payment (mock)
  if (isRequester && payment_confirmed && booking.status === 'accepted') {
    db.prepare('UPDATE bookings SET status = ?, payment_confirmed = 1 WHERE id = ?').run('paid', booking.id);
    return res.json({ message: 'Payment confirmed' });
  }

  res.status(400).json({ error: 'Invalid status transition' });
});

module.exports = router;
