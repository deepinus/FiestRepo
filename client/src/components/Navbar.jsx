import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
        <span className="text-2xl">✈</span> Airport Companion
      </Link>
      <div className="flex items-center gap-4 text-sm font-medium">
        {user ? (
          <>
            <Link to="/search" className="hover:text-blue-200">Find Companion</Link>
            {user.role === 'companion' && (
              <>
                <Link to="/my-listings" className="hover:text-blue-200">My Listings</Link>
                <Link to="/create-listing" className="hover:text-blue-200">+ New Listing</Link>
              </>
            )}
            <Link to="/my-bookings" className="hover:text-blue-200">My Bookings</Link>
            <span className="text-blue-200">|</span>
            <span className="text-blue-200 capitalize">{user.role}: {user.name}</span>
            <button onClick={handleLogout} className="bg-blue-900 hover:bg-blue-800 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-200">Login</Link>
            <Link to="/register" className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-50">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
