'use client';
import { useState } from 'react';

const ERROR_MESSAGES = {
  1: "Location access was denied. Please allow location access in your browser settings, or enter your address manually below.",
  2: "Your location couldn't be determined. Please try again or enter your address manually.",
  3: "Location request timed out. Please try again or enter your address manually.",
  default: "Unable to get your location. Please enter your address manually."
};

export default function LocationInput({ onLocationSet }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const useCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Your browser does not support location sharing. Please enter your address manually.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          );

          if (!response.ok) throw new Error('Geocoding failed');

          const data = await response.json();
          const addressText = data.features[0]?.place_name || 'Current Location';
          
          onLocationSet({ lat: latitude, lng: longitude, address: addressText });
        } catch (error) {
          console.error('Geocoding error:', error);
          // Still proceed with coordinates even if address lookup fails
          onLocationSet({ lat: latitude, lng: longitude, address: 'Current Location' });
        }
        
        setLoading(false);
      },
      (error) => {
        const message = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default;
        setError(message);
        console.error('Geolocation error:', error);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleManualAddress = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );

      if (!response.ok) throw new Error('Geocoding request failed');

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        onLocationSet({ lat, lng, address: data.features[0].place_name });
      } else {
        setError('Address not found. Please try a different address or be more specific.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Failed to find that address. Please check your connection and try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white border border-[#d0d0d0] rounded shadow-sm p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-[#37474f] mb-4">Set Your Location</h2>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Current Location Button */}
      <button
        onClick={useCurrentLocation}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] hover:from-[#7cb342] hover:to-[#8bc34a] text-white py-3 rounded mb-4 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {loading ? 'Getting location...' : 'Use My Current Location'}
      </button>
      
      <div className="text-center text-[#6b7c87] mb-4 font-medium text-sm">OR</div>
      
      {/* Manual Address Input */}
      <form onSubmit={handleManualAddress}>
        <input
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setError(''); }}
          placeholder="Enter your address"
          autoComplete="off"
          className="w-full bg-white border border-[#d0d0d0] text-[#37474f] rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-transparent placeholder-gray-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="w-full bg-white hover:bg-gray-50 text-[#37474f] border border-[#d0d0d0] py-3 rounded disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          {loading ? 'Finding address...' : 'Set Address'}
        </button>
      </form>
    </div>
  );
}