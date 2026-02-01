'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import LocationInput from '@/components/LocationInput';
import MapView from '@/components/MapView';
import VenueList from '@/components/VenueList';
import NameModal from '@/components/NameModal';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id;
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);

  useEffect(() => {
    // Generate unique user ID (stored in localStorage)
    let uid = localStorage.getItem('userId');
    if (!uid) {
      uid = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', uid);
    }
    setUserId(uid);

    // Listen to session updates in real-time
    const sessionRef = ref(database, `sessions/${sessionId}`);
    
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        // Session doesn't exist or expired
        setLoading(false);
        return;
      }
      
      // Check if session expired
      if (data.expiresAt < Date.now()) {
        alert('This session has expired');
        setLoading(false);
        return;
      }
      
      setSession(data);
      setLoading(false);
      
      // Check if this user has already joined
      if (data.users && data.users[uid]) {
        setHasJoined(true);
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  const joinSession = async (location) => {
    // Store location and show name modal
    setPendingLocation(location);
    setShowNameModal(true);
  };

  const handleNameSubmit = async (userName) => {
    const updates = {};
    
    updates[`sessions/${sessionId}/users/${userId}`] = {
      name: userName,
      location: pendingLocation,
      lastUpdated: Date.now()
    };
    
    await update(ref(database), updates);
    setHasJoined(true);
    setShowNameModal(false);
    setPendingLocation(null);
  };

  const handleNameCancel = () => {
    setShowNameModal(false);
    setPendingLocation(null);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied! Share it with your friend.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-4">This session may have expired or doesn't exist.</p>
          <a href="/" className="text-blue-500 hover:underline">Go Home</a>
        </div>
      </div>
    );
  }

  const userCount = Object.keys(session.users || {}).length;
  const canStart = userCount === 2;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white border border-[#d0d0d0] rounded shadow-sm p-4 sm:p-6 mb-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8bc34a] to-[#9ccc65] rounded flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#37474f]">Meet Me in the Middle</h1>
                <p className="text-base text-[#6b7c87] mt-1">
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${userCount === 2 ? 'bg-[#8bc34a]' : 'bg-[#ffc107]'}`}></span>
                    {userCount}/2 users connected
                  </span>
                </p>
              </div>
            </div>
            
            {/* Share Link Button */}
            <button 
              onClick={copyShareLink}
              className="bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] hover:from-[#7cb342] hover:to-[#8bc34a] text-white px-5 py-2.5 rounded transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Location Input - shows if user hasn't joined yet */}
        {!hasJoined && (
          <LocationInput onLocationSet={joinSession} />
        )}

        {/* Main App - shows when user has joined */}
        {hasJoined && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-7xl mx-auto">
            
            {/* Map */}
            <div className="bg-white border border-[#d0d0d0] rounded shadow-sm p-3 sm:p-6 order-1">
              <MapView 
                session={session} 
                currentUserId={userId}
                sessionId={sessionId}
              />
            </div>

            {/* Venues */}
            <div className="bg-white border border-[#d0d0d0] rounded shadow-sm p-2 sm:p-4 order-2">
              {canStart ? (
                <VenueList session={session} sessionId={sessionId} />
              ) : (
                <div className="text-center text-gray-500 py-8 sm:py-12">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-base sm:text-lg font-semibold mb-2">Waiting for other user...</p>
                  <p className="text-xs sm:text-sm">Share the link above to invite them!</p>
                </div>
              )}
            </div>
            
          </div>
        )}

      </div>

      {/* Name Modal */}
      <NameModal 
        isOpen={showNameModal}
        onSubmit={handleNameSubmit}
        onCancel={handleNameCancel}
      />
    </div>
  );
}