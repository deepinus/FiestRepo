import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  declined: 'bg-red-100 text-red-700 border-red-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
};

function RatingForm({ bookingId, rateeId, onDone }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.submitRating({ booking_id: bookingId, score, comment });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-sm font-medium text-yellow-800 mb-2">Leave a rating</p>
      <div className="flex items-center gap-2 mb-2">
        {[1,2,3,4,5].map(s => (
          <button type="button" key={s} onClick={() => setScore(s)}
            className={`text-2xl ${s <= score ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
        ))}
      </div>
      <input className="w-full border border-gray-300 rounded px-3 py-1 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-400"
        placeholder="Comment (optional)"
        value={comment} onChange={e => setComment(e.target.value)} />
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <button type="submit" disabled={loading}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded text-sm font-medium">
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingDone, setRatingDone] = useState(new Set());
  const [showRating, setShowRating] = useState(null);

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId, status, payment_confirmed) {
    try {
      await api.updateBookingStatus(bookingId, { status, payment_confirmed });
      await loadBookings();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Bookings</h1>
      <p className="text-gray-500 text-sm mb-8">
        {user.role === 'companion' ? 'Requests from travelers for your companion listings' : 'Your companion booking requests'}
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-xl font-medium">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <span>✈ {booking.flight_number}</span>
                    <span className="text-gray-400">·</span>
                    <span>{booking.origin} → {booking.destination}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600 font-normal">{booking.flight_date}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {user.role === 'companion'
                      ? <>Requested by: <span className="font-medium text-gray-700">{booking.requester_name}</span></>
                      : <>Companion: <span className="font-medium text-gray-700">{booking.companion_name}</span></>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Traveler: <span className="font-medium">{booking.traveler_name}</span>
                  </div>
                  {booking.traveler_needs && (
                    <div className="text-sm text-gray-500 mt-1 italic">"{booking.traveler_needs}"</div>
                  )}
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-xl font-bold text-green-600 mb-1">${booking.price}</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Companion actions */}
                {user.role === 'companion' && booking.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(booking.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium">
                      Accept
                    </button>
                    <button onClick={() => updateStatus(booking.id, 'declined')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm font-medium">
                      Decline
                    </button>
                  </>
                )}

                {/* Traveler: pay after acceptance */}
                {user.role === 'traveler' && booking.status === 'accepted' && (
                  <button onClick={() => updateStatus(booking.id, null, true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium">
                    Confirm Payment — ${booking.price}
                  </button>
                )}

                {/* Rate after paid */}
                {booking.status === 'paid' && !ratingDone.has(booking.id) && (
                  <button onClick={() => setShowRating(showRating === booking.id ? null : booking.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded text-sm font-medium">
                    Rate This Trip
                  </button>
                )}

                {ratingDone.has(booking.id) && (
                  <span className="text-green-600 text-sm font-medium">✓ Rated</span>
                )}
              </div>

              {showRating === booking.id && (
                <RatingForm
                  bookingId={booking.id}
                  rateeId={user.role === 'traveler' ? booking.companion_id : booking.requester_id}
                  onDone={() => {
                    setRatingDone(s => new Set([...s, booking.id]));
                    setShowRating(null);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
