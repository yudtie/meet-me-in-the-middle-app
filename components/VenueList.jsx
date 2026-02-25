'use client';
import { useState, useEffect, useRef } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';

const CATEGORY_LABELS = {
  dining: 'Food & Cafes',
  bars: 'Bars & Pubs',
  gas: 'Gas Stations',
  grocery: 'Grocery Stores',
  coffee: 'Coffee Shops',
  parks: 'Parks & Outdoors',
  bookstores: 'Book Stores',
  shopping: 'Shopping',
  golf: 'Golf Courses',
};

// Maps category IDs to keywords found in Mapbox poi_category values
const CATEGORY_KEYWORDS = {
  dining: ['restaurant', 'fast_food', 'pizza', 'bakery', 'diner', 'eatery', 'sandwich', 'burger', 'food'],
  bars: ['bar', 'pub', 'nightclub', 'brewery', 'wine', 'lounge', 'tavern'],
  gas: ['gas', 'fuel', 'petrol', 'ev_charging'],
  grocery: ['grocery', 'supermarket', 'food_and_drink', 'market'],
  coffee: ['coffee', 'cafe', 'espresso', 'tea', 'boba'],
  parks: ['park', 'playground', 'nature', 'garden', 'recreation', 'trail'],
  bookstores: ['book', 'library'],
  shopping: ['shopping', 'retail', 'department', 'mall'],
  golf: ['golf', 'country_club'],
};

export default function VenueList({ session, sessionId, onFilteredVenuesChange }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const venueListRef = useRef(null);

  const venues = session?.venues || [];
  const users = session?.users ? Object.values(session.users) : [];

  // Categories the group selected at join time
  const sessionCategories = session?.categories || ['dining', 'bars'];

  // Get simplified category for a venue
  const getVenueCategory = (rawCategory) => {
    const lower = rawCategory?.toLowerCase() || '';
    for (const [group, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => lower.includes(k))) return group;
    }
    return 'other';
  };

  // Build filter tabs: only the selected categories that have at least 1 matching venue
  const availableCategories = sessionCategories.filter(cat =>
    venues.some(v => getVenueCategory(v.category) === cat)
  );

  // Filter venues by selected category — default to first available if 'all' is somehow set
  const activeCategory = availableCategories.includes(selectedCategory) ? selectedCategory : (availableCategories[0] || 'other');
  const filteredVenues = venues.filter(v => getVenueCategory(v.category) === activeCategory);

  // Notify parent when filtered venues change so map can update
  useEffect(() => {
    if (onFilteredVenuesChange) onFilteredVenuesChange(filteredVenues);
  }, [filteredVenues.length, activeCategory]);

  const selectVenue = async (venue) => {
    const updates = {};
    updates[`sessions/${sessionId}/selectedVenue`] = venue;
    await update(ref(database), updates);
  };

  const updateCategory = async (category) => {
    setSelectedCategory(category);
    const updates = {};
    updates[`sessions/${sessionId}/selectedCategory`] = category;
    await update(ref(database), updates);
  };

  const calculateVenues = async () => {
    if (users.length < 2) return;
    setLoading(true);
    setError('');

    const usersWithLocations = users.filter(u => u.location?.lat && u.location?.lng);
    if (usersWithLocations.length < 2) {
      setError('Not enough users have shared their location yet.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/calculate-midpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          users: usersWithLocations,
          categories: sessionCategories,
        })
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      if (!data.venues || data.venues.length === 0) {
        setError('No venues found near your midpoint. Try different categories or recalculate.');
      }
    } catch (err) {
      console.error('Error calculating venues:', err);
      setError('Failed to find venues. Please check your connection and try again.');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (users.length >= 2 && !loading) {
      if (venues.length === 0) {
        calculateVenues();
      } else if (venues[0]?.driveTimes?.length !== users.length) {
        calculateVenues();
      }
    }
  }, [users.length]);

  useEffect(() => {
    if (session?.selectedCategory) {
      setSelectedCategory(session.selectedCategory);
    }
  }, [session?.selectedCategory]);

  useEffect(() => {
    if (session?.selectedVenue) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (venueListRef.current) {
            venueListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      });
    }
  }, [session?.selectedVenue?.id]);

  if (loading || (users.length >= 2 && venues.length === 0 && !error)) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Finding the best places to meet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-red-600 font-medium mb-2">Something went wrong</p>
        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">{error}</p>
        <button
          onClick={calculateVenues}
          className="bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] text-white px-6 py-2 rounded font-medium shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No venues found</p>
        <button
          onClick={calculateVenues}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#37474f] mb-2">
          Suggested Meeting Spots ({filteredVenues.length})
        </h2>
        <p className="text-sm text-[#6b7c87]">
          Sorted by fairest drive time for all users
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {availableCategories.map(cat => (
          <label
            key={cat}
            onClick={() => updateCategory(cat)}
            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all text-sm ${
              activeCategory === cat
                ? 'bg-green-50 border border-[#8bc34a]'
                : 'bg-white border border-[#d0d0d0] hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="category"
              checked={activeCategory === cat}
              onChange={() => updateCategory(cat)}
              className="w-4 h-4 text-[#8bc34a] accent-[#8bc34a]"
            />
            <span className="truncate">
              {CATEGORY_LABELS[cat] || cat}
            </span>
          </label>
        ))}
      </div>

      {/* Empty state for a specific category filter */}
      {filteredVenues.length === 0 && (
        <div className="text-center py-8 text-[#6b7c87]">
          <p>No {CATEGORY_LABELS[activeCategory] || activeCategory} found near the midpoint.</p>
        </div>
      )}

      {/* Venue List */}
      <div ref={venueListRef} className="flex-1 overflow-y-auto space-y-3">
        {(() => {
          const selectedVenue = session?.selectedVenue;
          const selectedIndex = filteredVenues.findIndex(v => v.id === selectedVenue?.id);
          let orderedVenues = [...filteredVenues];
          if (selectedIndex > -1) {
            const [selected] = orderedVenues.splice(selectedIndex, 1);
            orderedVenues.unshift(selected);
          }

          return orderedVenues.map((venue, filteredIndex) => {
            const isSelected = session?.selectedVenue?.id === venue.id;

            return (
              <div
                key={venue.id}
                onClick={() => selectVenue(venue)}
                className={`border rounded p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#8bc34a] bg-green-50 shadow-md'
                    : 'border-[#d0d0d0] bg-white hover:border-[#8bc34a] hover:shadow-sm'
                }`}
              >
                {/* Venue Header */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-500 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                      {filteredIndex + 1}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg flex-1 min-w-0 truncate text-[#37474f]">{venue.name}</h3>
                    <span className="bg-gray-100 text-[#6b7c87] px-2 py-1 rounded text-xs flex-shrink-0 border border-[#d0d0d0]">
                      {venue.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6b7c87] line-clamp-2">{venue.address}</p>
                </div>

                {/* Drive Times */}
                <div className={`grid gap-2 sm:gap-3 mt-3 ${
                  venue.driveTimes.length === 2 ? 'grid-cols-2' :
                  venue.driveTimes.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2'
                }`}>
                  {venue.driveTimes.map((dt, idx) => {
                    const user = users[dt.userIndex];
                    const colors = [
                      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', light: 'text-blue-500' },
                      { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', light: 'text-green-500' },
                      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', light: 'text-purple-500' },
                      { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', light: 'text-orange-500' },
                    ];
                    const color = colors[idx] || colors[0];
                    return (
                      <div key={dt.userIndex} className={`${color.bg} border ${color.border} rounded p-2 sm:p-3`}>
                        <div className="text-xs text-[#6b7c87] truncate">{user?.name || `User ${dt.userIndex + 1}`}</div>
                        <div className={`font-bold ${color.text} text-sm sm:text-base`}>{dt.driveTime} min</div>
                        <div className={`text-xs ${color.light} mt-1`}>{dt.distance ? `${dt.distance} mi` : ''}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Fairness Info */}
                <div className="mt-3 flex items-center justify-between text-xs text-[#6b7c87]">
                  <span>Max difference: <strong className="text-[#37474f]">{venue.timeDifference} min</strong></span>
                  <span>Avg: <strong className="text-[#37474f]">{venue.avgTime} min</strong></span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="mt-3 bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] text-white text-center py-2 rounded font-bold shadow-md">
                    ✓ Selected Meeting Spot
                  </div>
                )}

                {/* Get Directions */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${venue.location.lat},${venue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full bg-[#5dade2] hover:bg-[#4a9dd1] text-white py-2.5 rounded font-medium shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Get Directions
                </a>
              </div>
            );
          });
        })()}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={calculateVenues}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-50 border border-[#d0d0d0] text-[#37474f] py-2 rounded disabled:bg-gray-100 transition-colors font-medium shadow-sm"
        >
          🔄 Recalculate Venues
        </button>
      </div>

    </div>
  );
}