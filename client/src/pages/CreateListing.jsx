import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const SERVICE_OPTIONS = [
  'boarding', 'customs', 'immigration', 'translation', 'baggage', 'navigation', 'mobility assistance', 'form filling',
];

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    flight_number: '', flight_date: '', origin: '', destination: '',
    services: [], price: '', description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'companion') {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Only companions can create listings.</p>
      </div>
    );
  }

  function toggleService(svc) {
    setForm(f => ({
      ...f,
      services: f.services.includes(svc) ? f.services.filter(s => s !== svc) : [...f.services, svc],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.services.length === 0) { setError('Please select at least one service'); return; }
    setLoading(true);
    try {
      await api.createListing({ ...form, price: parseFloat(form.price) });
      navigate('/my-listings');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Create a Companion Listing</h1>
      <p className="text-gray-500 mb-8">List yourself as available to help fellow passengers on your upcoming flight.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">Flight Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="e.g. LH760"
                value={form.flight_number}
                onChange={e => setForm(f => ({ ...f, flight_number: e.target.value.toUpperCase() }))}
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.flight_date}
                onChange={e => setForm(f => ({ ...f, flight_date: e.target.value }))}
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin (airport code)</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="e.g. DEL"
                value={form.origin}
                onChange={e => setForm(f => ({ ...f, origin: e.target.value.toUpperCase() }))}
                required maxLength={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination (airport code)</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="e.g. FRA"
                value={form.destination}
                onChange={e => setForm(f => ({ ...f, destination: e.target.value.toUpperCase() }))}
                required maxLength={3} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Services You Can Offer</label>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_OPTIONS.map(svc => (
              <button type="button" key={svc}
                onClick={() => toggleService(svc)}
                className={`py-2 px-3 rounded-lg border-2 text-sm font-medium capitalize transition-colors text-left ${form.services.includes(svc) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {form.services.includes(svc) ? '✓ ' : ''}{svc}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input type="number" min="1" step="1"
              className="w-full border border-gray-300 rounded-lg px-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Description (optional)</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            placeholder="Describe what you can help with, your experience, etc."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/my-listings')}
            className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors">
            {loading ? 'Creating...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
