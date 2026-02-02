'use client';
import { useState, useEffect, useRef } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';


export default function VenueList({ session, sessionId }) {
  const [selectedCategory, setSelectedCategory] = useState(session?.selectedCategory || 'all');
  const [loading, setLoading] = useState(false);
  const venueListRef = useRef(null);

  const venues = session?.venues || [];
  const users = session?.users ? Object.values(session.users) : [];

  // Filter venues by category
  const filteredVenues = selectedCategory === 'all' 
    ? venues 
    : venues.filter(v => v.category === selectedCategory);

  // Get unique categories from venues
  const categories = ['all', ...new Set(venues.map(v => v.category))];

  // Select a venue as the final meeting spot
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

  // Trigger initial calculation when both users are present
  useEffect(() => {
    if (users.length === 2 && venues.length === 0 && !loading) {
      calculateVenues();
    }
  }, [users.length]);

  // Listen for category changes from other user
  useEffect(() => {
    if (session?.selectedCategory) {
      setSelectedCategory(session.selectedCategory);
    }
  }, [session?.selectedCategory]);

  // Auto-scroll to top when venue is selected
  useEffect(() => {
    if (session?.selectedVenue) {
      // Double requestAnimationFrame to ensure React has finished re-rendering
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Scroll the window to top
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          // Also scroll the container if it's scrollable
          if (venueListRef.current) {
            venueListRef.current.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }, [session?.selectedVenue?.id]);

  const calculateVenues = async () => {
    if (users.length !== 2) return;
    
    setLoading(true);
    
    const [user1, user2] = users;
    
    try {
      await fetch('/api/calculate-midpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          location1: user1.location,
          location2: user2.location
        })
      });
    } catch (error) {
      console.error('Error calculating venues:', error);
      alert('Failed to find venues. Please try again.');
    }
    
    setLoading(false);
  };

  // Loading state
  if (loading || (users.length === 2 && venues.length === 0)) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Finding the best places to meet...</p>
      </div>
    );
  }

  // No venues found
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
          Sorted by fairest drive time for both users
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => updateCategory(cat)}
            className={`px-4 py-2 rounded whitespace-nowrap transition-all font-medium text-sm ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] text-white shadow-md'
                : 'bg-white text-[#37474f] border border-[#d0d0d0] hover:bg-gray-50'
            }`}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Venue List */}
      <div ref={venueListRef} className="flex-1 overflow-y-auto space-y-3">
        {(() => {
        // Separate selected venue from others
        const selectedVenue = session?.selectedVenue;
        const selectedIndex = filteredVenues.findIndex(v => v.id === selectedVenue?.id);
        
        // Reorder: selected venue first, then the rest
        let orderedVenues = [...filteredVenues];
        if (selectedIndex > -1) {
          const [selected] = orderedVenues.splice(selectedIndex, 1);
          orderedVenues.unshift(selected);
        }
  
          return orderedVenues.map((venue) => {
            const isSelected = session?.selectedVenue?.id === venue.id;
            // Use original index from venues array to match map markers
            const originalIndex = venues.findIndex(v => v.id === venue.id);

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
                    {originalIndex + 1}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg flex-1 min-w-0 truncate text-[#37474f]">{venue.name}</h3>
                  <span className="bg-gray-100 text-[#6b7c87] px-2 py-1 rounded text-xs flex-shrink-0 border border-[#d0d0d0]">
                    {venue.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#6b7c87] line-clamp-2">{venue.address}</p>
              </div>

              {/* Drive Times */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                <div className="bg-blue-50 border border-blue-200 rounded p-2 sm:p-3">
                  <div className="text-xs text-[#6b7c87] truncate">{users[0]?.name || 'User 1'}</div>
                  <div className="font-bold text-blue-600 text-sm sm:text-base">
                    {venue.driveTimeUser1} min
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    {venue.distanceUser1 ? `${venue.distanceUser1} mi` : ''}
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded p-2 sm:p-3">
                  <div className="text-xs text-[#6b7c87] truncate">{users[1]?.name || 'User 2'}</div>
                  <div className="font-bold text-green-600 text-sm sm:text-base">
                    {venue.driveTimeUser2} min
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    {venue.distanceUser2 ? `${venue.distanceUser2} mi` : ''}
                  </div>
                </div>
              </div>

              {/* Fairness Indicator */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#6b7c87]">
                <span>
                  Time difference: <strong className="text-[#37474f]">{venue.timeDifference} min</strong>
                </span>
                <span>
                  {venue.distanceFromMidpoint} mi from midpoint
                </span>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="mt-3 bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] text-white text-center py-2 rounded font-bold shadow-md">
                  ✓ Selected Meeting Spot
                </div>
              )}

              {/* Get Directions Button */}

              <a href={`https://www.google.com/maps/dir/?api=1&destination=${venue.location.lat},${venue.location.lng}`}
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
        });})()}
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