import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMyListings()
      .then(setListings)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function toggleStatus(listing) {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateListing(listing.id, { status: newStatus });
      setListings(ls => ls.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert(err.message);
    }
  }

  if (!user || user.role !== 'companion') {
    return <div className="text-center py-20 text-gray-600">Only companions can view this page.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">Your companion offerings on upcoming flights</p>
        </div>
        <Link to="/create-listing" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
          + New Listing
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">✈</div>
          <p className="text-xl font-medium">No listings yet</p>
          <p className="text-sm mt-2 mb-6">Create your first listing to start helping fellow travelers.</p>
          <Link to="/create-listing" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-800 text-lg">{listing.flight_number}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{listing.origin} → {listing.destination}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{listing.flight_date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {listing.services.map(svc => (
                      <span key={svc} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs capitalize border border-blue-200">
                        {svc}
                      </span>
                    ))}
                  </div>
                  {listing.pending_requests > 0 && (
                    <div className="mt-2">
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium border border-orange-200">
                        {listing.pending_requests} pending request{listing.pending_requests > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-xl font-bold text-green-600 mb-2">${listing.price}</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {listing.status}
                  </span>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => toggleStatus(listing)}
                      className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
                      {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => navigate('/my-bookings')}
                      className="text-xs px-3 py-1 bg-blue-50 border border-blue-200 rounded text-blue-600 hover:bg-blue-100">
                      Bookings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
