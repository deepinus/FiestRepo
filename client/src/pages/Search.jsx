import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function StarRating({ score, count }) {
  if (!score) return <span className="text-gray-400 text-sm">No ratings yet</span>;
  return (
    <span className="text-sm">
      {'★'.repeat(Math.round(score))}{'☆'.repeat(5 - Math.round(score))}
      <span className="text-gray-500 ml-1">{score} ({count})</span>
    </span>
  );
}

export default function Search() {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.searchFlights(flightNumber, flightDate);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find a Companion</h1>
        <p className="text-gray-500 mt-2">Search by flight number and date to find available helpers on the same flight</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="e.g. LH760"
              value={flightNumber}
              onChange={e => setFlightNumber(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={flightDate}
              onChange={e => setFlightDate(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {results !== null && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl font-medium">No companions found for this flight</p>
              <p className="text-sm mt-2">Try a different flight or date, or check back closer to the travel date.</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4 font-medium">{results.length} companion{results.length > 1 ? 's' : ''} available on {results[0]?.flight_number} — {results[0]?.origin} → {results[0]?.destination}</p>
              <div className="space-y-4">
                {results.map(listing => (
                  <div key={listing.listing_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                            {listing.companion_name[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{listing.companion_name}</h3>
                            <StarRating score={listing.avg_rating} count={listing.rating_count} />
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mt-2 mb-3">{listing.companion_bio || 'No bio provided.'}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {listing.companion_languages.map(lang => (
                            <span key={lang} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">
                              🗣 {lang}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {listing.services.map(svc => (
                            <span key={svc} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200 capitalize">
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-2xl font-bold text-green-600">${listing.price}</div>
                        <div className="text-gray-400 text-xs mb-3">per journey</div>
                        <button
                          onClick={() => navigate(`/companion/${listing.listing_id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          View & Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
