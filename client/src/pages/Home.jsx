import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Travel Smarter,<br />Together
        </h1>
        <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
          Connect vulnerable travelers with caring fellow passengers. Get help with boarding,
          customs, immigration, and translation — all on the same flight.
        </p>
        {user ? (
          <div className="flex justify-center gap-4">
            <Link to="/search" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Find a Companion
            </Link>
            {user.role === 'companion' && (
              <Link to="/create-listing" className="bg-blue-500 border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-400 transition-colors">
                Offer Help
              </Link>
            )}
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Get Started
            </Link>
            <Link to="/login" className="bg-blue-500 border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-400 transition-colors">
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-white text-gray-800 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Search Your Flight', desc: 'Enter the flight number and date to find available companions traveling on the same flight.' },
              { icon: '🤝', title: 'Book a Companion', desc: 'Browse companion profiles, check languages spoken and services offered, then request their help.' },
              { icon: '✅', title: 'Travel with Confidence', desc: 'Your companion meets your loved one at the airport and assists through boarding, customs, and more.' },
            ].map(step => (
              <div key={step.title} className="text-center p-6 rounded-xl bg-blue-50">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Services Available</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🛫', label: 'Boarding Assistance' },
              { icon: '🛃', label: 'Customs Help' },
              { icon: '🛂', label: 'Immigration Support' },
              { icon: '🗣', label: 'Translation' },
              { icon: '♿', label: 'Mobility Assistance' },
              { icon: '🧳', label: 'Baggage Help' },
              { icon: '🗺', label: 'Navigation' },
              { icon: '📋', label: 'Form Filling' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-medium text-gray-700">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div className="bg-blue-700 text-white py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to help or get help?</h2>
          <p className="text-blue-200 mb-8">Join thousands of travelers making journeys easier for each other.</p>
          <Link to="/register" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Sign Up for Free
          </Link>
        </div>
      )}
    </div>
  );
}
