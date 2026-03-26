const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // Flights
  searchFlights: (flight_number, flight_date) =>
    request(`/flights/search?flight_number=${encodeURIComponent(flight_number)}&flight_date=${encodeURIComponent(flight_date)}`),

  // Companions
  createListing: (body) => request('/companions', { method: 'POST', body: JSON.stringify(body) }),
  getMyListings: () => request('/companions/mine'),
  getListingDetail: (id) => request(`/companions/${id}`),
  updateListing: (id, body) => request(`/companions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Bookings
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/mine'),
  updateBookingStatus: (id, body) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Ratings
  submitRating: (body) => request('/ratings', { method: 'POST', body: JSON.stringify(body) }),
  getUserRatings: (userId) => request(`/ratings/user/${userId}`),
};
