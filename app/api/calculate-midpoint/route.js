import { NextResponse } from 'next/server';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { sessionId, users } = await request.json();
    
    if (!users || users.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 users required' },
        { status: 400 }
      );
    }

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Calculate geographic center of all users
    const avgLat = users.reduce((sum, u) => sum + u.location.lat, 0) / users.length;
    const avgLng = users.reduce((sum, u) => sum + u.location.lng, 0) / users.length;

    // Use the geographic center as the midpoint
    const midpoint = { lat: avgLat, lng: avgLng };

    // Search for venues near the midpoint
    const searchResponse = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/category/cafe,restaurant,bar,gas_station?proximity=${midpoint.lng},${midpoint.lat}&limit=20&access_token=${MAPBOX_TOKEN}`
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to search venues');
    }

    const searchData = await searchResponse.json();
    const venues = searchData.features || [];

    // Calculate drive times for ALL users to each venue
    const venuesWithDriveTimes = await Promise.all(
      venues.map(async (venue) => {
        const venueLat = venue.geometry.coordinates[1];
        const venueLng = venue.geometry.coordinates[0];

        // Get drive times for all users
        const driveTimes = await Promise.all(
          users.map(async (user, index) => {
            const dirResponse = await fetch(
              `https://api.mapbox.com/directions/v5/mapbox/driving/${user.location.lng},${user.location.lat};${venueLng},${venueLat}?access_token=${MAPBOX_TOKEN}`
            );
            const dirData = await dirResponse.json();
            const route = dirData.routes?.[0];

            return {
              userIndex: index,
              driveTime: route ? Math.round(route.duration / 60) : null,
              distance: route ? (route.distance / 1609.34).toFixed(1) : null
            };
          })
        );

        // Calculate fairness metrics
        const times = driveTimes.map(dt => dt.driveTime).filter(t => t !== null);
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const timeDifference = maxTime - minTime;

        return {
          id: venue.properties.mapbox_id,
          name: venue.properties.name,
          address: venue.properties.full_address || venue.properties.place_formatted,
          category: venue.properties.poi_category?.[0] || 'venue',
          location: { lat: venueLat, lng: venueLng },
          driveTimes: driveTimes,
          maxTime,
          minTime,
          avgTime: Math.round(avgTime),
          timeDifference,
          distanceFromMidpoint: (
            Math.sqrt(
              Math.pow(venueLat - midpoint.lat, 2) +
              Math.pow(venueLng - midpoint.lng, 2)
            ) * 69
          ).toFixed(1)
        };
      })
    );

    // Sort by fairness (smallest time difference, then smallest max time)
    const sortedVenues = venuesWithDriveTimes.sort((a, b) => {
      if (a.timeDifference !== b.timeDifference) {
        return a.timeDifference - b.timeDifference;
      }
      return a.maxTime - b.maxTime;
    });

    const finalVenues = sortedVenues.slice(0, 15);

    // Save results to Firebase
    if (sessionId) {
      const updates = {};
      updates[`sessions/${sessionId}/midpoint`] = midpoint;
      updates[`sessions/${sessionId}/venues`] = finalVenues;
      await update(ref(database), updates);
    }

    return NextResponse.json({
      midpoint,
      venues: finalVenues
    });

  } catch (error) {
    console.error('Error calculating midpoint:', error);
    return NextResponse.json(
      { error: 'Failed to calculate midpoint' },
      { status: 500 }
    );
  }
}