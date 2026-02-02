'use client';
import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import 'mapbox-gl/dist/mapbox-gl.css';
import { timeAgo } from '@/lib/timeAgo';

export default function MapView({ session, currentUserId, sessionId }) {
  const mapRef = useRef();
  const [viewport, setViewport] = useState({
    latitude: 28.5383,
    longitude: -81.3792,
    zoom: 10
  });
  const [updating, setUpdating] = useState(false);
  const [routes, setRoutes] = useState([]);

  // Calculate bounds to fit all markers
  useEffect(() => {
    if (!session?.users || !mapRef.current) return;

    const users = Object.values(session.users);
    if (users.length === 0) return;

    const points = [];
    
    users.forEach(user => {
      if (user.location) {
        points.push([user.location.lng, user.location.lat]);
      }
    });

    if (session.midpoint) {
      points.push([session.midpoint.lng, session.midpoint.lat]);
    }

    if (session.venues) {
      session.venues.forEach(venue => {
        points.push([venue.location.lng, venue.location.lat]);
      });
    }

    if (points.length > 0) {
      const lngs = points.map(p => p[0]);
      const lats = points.map(p => p[1]);
      
      const bounds = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)]
      ];

      mapRef.current?.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      });
    }
  }, [session?.users, session?.midpoint, session?.venues]);

  // Update current user's location
  const updateMyLocation = async () => {
    setUpdating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || 'Current Location';

          const updates = {};
          updates[`sessions/${sessionId}/users/${currentUserId}/location`] = {
            lat: latitude,
            lng: longitude,
            address: address
          };
          updates[`sessions/${sessionId}/users/${currentUserId}/lastUpdated`] = Date.now();

          await update(ref(database), updates);
          
          // Trigger recalculation
          await recalculateMidpointAndVenues();
        } catch (error) {
          console.error('Error updating location:', error);
          alert('Failed to update location');
        }
        
        setUpdating(false);
      },
      (error) => {
        alert('Unable to get your location');
        console.error(error);
        setUpdating(false);
      }
    );
  };

  // Recalculate midpoint and venues
  const recalculateMidpointAndVenues = async () => {
    const userList = Object.values(session.users);
    if (userList.length < 2) return;

    // Filter users with valid locations
    const usersWithLocations = userList.filter(u => u.location?.lat && u.location?.lng);

    if (usersWithLocations.length < 2) return;

    try {
      await fetch('/api/calculate-midpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          users: usersWithLocations
        })
      });
    } catch (error) {
      console.error('Error recalculating:', error);
    }
  };

  const users = session?.users ? Object.entries(session.users) : [];
  const currentUser = session?.users?.[currentUserId];

  // Fetch driving routes when venue is selected
  useEffect(() => {
    if (!session?.selectedVenue || !session?.users) return;

    const userList = Object.values(session.users);
    if (userList.length < 2) return;

    const venue = session.selectedVenue;
    if (!venue?.location?.lat) return;

    const fetchRoutes = async () => {
      try {
        // Fetch routes for all users with valid locations
        const routePromises = userList
          .filter(user => user?.location?.lat && user?.location?.lng)
          .map(async (user, index) => {
            const response = await fetch(
              `https://api.mapbox.com/directions/v5/mapbox/driving/${user.location.lng},${user.location.lat};${venue.location.lng},${venue.location.lat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
            );
            const data = await response.json();
            return {
              index,
              geometry: data.routes?.[0]?.geometry || null
            };
          });

        const fetchedRoutes = await Promise.all(routePromises);
        setRoutes(fetchedRoutes.filter(r => r.geometry));
      } catch (error) {
        console.error('Error fetching routes:', error);
        setRoutes([]);
      }
    };

    fetchRoutes();
  }, [session?.selectedVenue?.id, session?.users]);


  return (
    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px]">
      
      {/* Update Location Button */}
      {currentUser && (
        <button
          onClick={updateMyLocation}
          disabled={updating}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white border border-[#d0d0d0] hover:bg-gray-50 text-[#37474f] shadow-md px-3 py-2 sm:px-4 sm:py-2 rounded disabled:bg-gray-100 transition-all text-sm sm:text-base font-medium inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {updating ? 'Updating...' : 'Update'}
        </button>
      )}

      {/* Map */}
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
      >
        
        {/* User Markers */}
        {users.map(([userId, user], index) => {
          // Skip if user doesn't have location
          if (!user?.location?.lat || !user?.location?.lng) return null;

          const isCurrentUser = userId === currentUserId;
          const colors = [
            { bg: 'bg-blue-500', border: 'border-blue-700' },
            { bg: 'bg-green-500', border: 'border-green-700' },
            { bg: 'bg-purple-500', border: 'border-purple-700' },
            { bg: 'bg-orange-500', border: 'border-orange-700' },
          ];
          const color = colors[index] || colors[0];

          return (
            <Marker
              key={userId}
              latitude={user.location.lat}
              longitude={user.location.lng}
            >
              <div className="relative">
                <div className={`w-10 h-10 ${color.bg} rounded-full ${color.border} border-4 flex items-center justify-center text-white font-bold shadow-lg`}>
                  {index + 1}
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap border border-[#d0d0d0]">
                  <div className="font-semibold text-[#37474f]">{user.name}</div>
                  <div className="text-[#6b7c87] text-xs">{timeAgo(user.lastUpdated)}</div>
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Midpoint Marker */}
        {session?.midpoint?.lat && session?.midpoint?.lng && (
          <Marker
            latitude={session.midpoint.lat}
            longitude={session.midpoint.lng}
          >
            <div className="w-10 h-10 bg-pink-500 rounded-full border-4 border-pink-700 flex items-center justify-center text-white font-bold shadow-lg">
              ⭐
            </div>
          </Marker>
        )}

        {/* Route Lines - All Users to Selected Venue */}
        {routes.map((route) => {
          const routeColors = ['#3b82f6', '#22c55e', '#a855f7', '#f97316'];
          const color = routeColors[route.index] || routeColors[0];

          return (
            <Source key={`route-${route.index}`} type="geojson" data={route.geometry}>
              <Layer
                type="line"
                paint={{
                  'line-color': color,
                  'line-width': 4,
                  'line-opacity': 0.7
                }}
              />
            </Source>
          );
        })}

        {/* Venue Markers */}
        {session?.venues?.map((venue, index) => {
          const isSelected = session?.selectedVenue?.id === venue.id;
          
          return (
            <Marker
              key={venue.id}
              latitude={venue.location.lat}
              longitude={venue.location.lng}
            >
              <div
                className={`rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform ${
                  isSelected
                    ? 'w-12 h-12 bg-yellow-500 border-4 border-yellow-700 animate-pulse'
                    : 'w-8 h-8 bg-red-500 border-2 border-red-700'
                }`}
                title={venue.name}
              >
                {isSelected ? '★' : index + 1}
              </div>
            </Marker>
          );
        })}

        {/* Lines connecting users to midpoint */}
        {session?.midpoint && users.length === 2 && (
          <>
            {users.map(([userId, user]) => {
              if (!user.location) return null;
              
              const lineData = {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [user.location.lng, user.location.lat],
                    [session.midpoint.lng, session.midpoint.lat]
                  ]
                }
              };

              return (
                <Source key={`line-${userId}`} type="geojson" data={lineData}>
                  <Layer
                    type="line"
                    paint={{
                      'line-color': userId === currentUserId ? '#3b82f6' : '#22c55e',
                      'line-width': 2,
                      'line-dasharray': [2, 2]
                    }}
                  />
                </Source>
              );
            })}
          </>
        )}

      </Map>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white border border-[#d0d0d0] p-2 sm:p-3 rounded shadow-md text-xs max-w-[200px]">
        {users.map(([userId, user], index) => {
          const colors = [
            'bg-blue-500 border-blue-700',
            'bg-green-500 border-green-700',
            'bg-purple-500 border-purple-700',
            'bg-orange-500 border-orange-700',
          ];
          const color = colors[index] || colors[0];

          return (
            <div key={userId} className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 ${color} rounded-full border-2`}></div>
              <span className="text-[#37474f] font-medium truncate">{user.name}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-pink-500 rounded-full border-2 border-pink-700"></div>
          <span className="text-[#37474f] font-medium">Midpoint</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-700"></div>
          <span className="text-[#37474f] font-medium">Venues</span>
        </div>
      </div>

    </div>
  );
}