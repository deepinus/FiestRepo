import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function StarRating({ score }) {
  if (!score) return null;
  return (
    <span className="text-yellow-500">
      {'★'.repeat(Math.round(score))}{'☆'.repeat(5 - Math.round(score))}
      <span className="text-gray-600 ml-1 text-sm">{score}/5</span>
    </span>
  );
}

export default function CompanionDetail() {
  const { listingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingForm, setBookingForm] = useState({ traveler_name: '', traveler_needs: '' });
  const [bookingStep, setBookingStep] = useState('form'); // form | confirm | success
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    api.getListingDetail(listingId)
      .then(setListing)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  async function handleBook(e) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setBookingStep('confirm');
  }

  async function handleConfirmPayment() {
    setError('');
    try {
      const { id } = await api.createBooking({
        listing_id: parseInt(listingId),
        traveler_name: bookingForm.traveler_name,
        traveler_needs: bookingForm.traveler_needs,
      });
      // Mock payment: immediately mark as paid after companion accepts (simplified for MVP: just set confirmed)
      setBookingId(id);
      setBookingStep('success');
    } catch (err) {
      setError(err.message);
      setBookingStep('form');
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (error && !listing) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!listing) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6 flex items-center gap-1">
        ← Back to results
      </button>

      <div className="bg-white rounded-xl shadow-md p-8">
        {/* Companion Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl flex-shrink-0">
            {listing.companion_name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{listing.companion_name}</h1>
            <StarRating score={listing.avg_rating} />
            <p className="text-gray-500 text-sm mt-1">{listing.ratings.length} review{listing.ratings.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-green-600">${listing.price}</div>
            <div className="text-gray-400 text-sm">per journey</div>
          </div>
        </div>

        {/* Flight Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800 font-semibold">
            <span>✈</span>
            <span>{listing.flight_number}</span>
            <span className="text-gray-400">·</span>
            <span>{listing.origin} → {listing.destination}</span>
            <span className="text-gray-400">·</span>
            <span>{listing.flight_date}</span>
          </div>
        </div>

        {/* Bio */}
        {listing.companion_bio && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-2">About</h2>
            <p className="text-gray-600">{listing.companion_bio}</p>
          </div>
        )}

        {/* Languages */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Languages</h2>
          <div className="flex flex-wrap gap-2">
            {listing.companion_languages.map(lang => (
              <span key={lang} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                🗣 {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Services Offered</h2>
          <div className="flex flex-wrap gap-2">
            {listing.services.map(svc => (
              <span key={svc} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200 capitalize">
                {svc}
              </span>
            ))}
          </div>
          {listing.description && <p className="text-gray-600 mt-3 text-sm">{listing.description}</p>}
        </div>

        {/* Reviews */}
        {listing.ratings.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-gray-700 mb-3">Reviews</h2>
            <div className="space-y-3">
              {listing.ratings.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-700">{r.rater_name}</span>
                    <span className="text-yellow-500">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Section */}
        {bookingStep === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Booking Request Sent!</h3>
            <p className="text-green-600 mb-4">Your request has been sent to {listing.companion_name}. You'll be notified when they accept.</p>
            <button onClick={() => navigate('/my-bookings')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
              View My Bookings
            </button>
          </div>
        ) : bookingStep === 'confirm' ? (
          <div className="border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Booking</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Companion</span><span className="font-medium">{listing.companion_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Flight</span><span className="font-medium">{listing.flight_number} — {listing.flight_date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Traveler</span><span className="font-medium">{bookingForm.traveler_name}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total</span><span className="text-green-600">${listing.price}</span></div>
            </div>
            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
            <div className="flex gap-3">
              <button onClick={() => setBookingStep('form')} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50">
                Back
              </button>
              <button onClick={handleConfirmPayment} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold">
                Confirm & Pay ${listing.price}
              </button>
            </div>
          </div>
        ) : (
          user ? (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Request This Companion</h3>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traveler's Full Name</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name of the person who needs help"
                    value={bookingForm.traveler_name}
                    onChange={e => setBookingForm(f => ({ ...f, traveler_name: e.target.value }))}
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Needs / Notes</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    placeholder="e.g. Senior citizen, cannot speak English, needs help at customs and immigration..."
                    value={bookingForm.traveler_needs}
                    onChange={e => setBookingForm(f => ({ ...f, traveler_needs: e.target.value }))} />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Request Companion — ${listing.price}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6 border border-gray-200 rounded-xl">
              <p className="text-gray-600 mb-3">Sign in to book this companion</p>
              <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                Sign In
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
