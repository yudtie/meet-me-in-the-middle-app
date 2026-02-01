'use client';
import { useRouter } from 'next/navigation';
import { ref, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();

  const createSession = async () => {
    try {
      const sessionsRef = ref(database, 'sessions');
      const newSessionRef = push(sessionsRef);
      const sessionId = newSessionRef.key;
      
      await set(newSessionRef, {
        createdAt: Date.now(),
        expiresAt: Date.now() + (6 * 60 * 60 * 1000),
        users: {},
        midpoint: null,
        venues: []
      });
      
      router.push(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      <div className="text-center max-w-4xl mx-auto">
        
        {/* Logo */}
        <div className="mb-8 inline-block">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8bc34a] to-[#9ccc65] rounded flex items-center justify-center shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#37474f] mb-4">
          Meet Me in the Middle
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-[#6b7c87] mb-12 max-w-2xl mx-auto">
          Find the perfect meeting spot with intelligent midpoint calculation 
          and real-time location sharing
        </p>
        
        {/* CTA Button */}
        <button 
          onClick={createSession}
          className="bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] hover:from-[#7cb342] hover:to-[#8bc34a] text-white px-8 py-3 rounded text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center gap-3"
        >
          <span>Create New Meeting</span>
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        
        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#d0d0d0] rounded p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8bc34a] to-[#9ccc65] rounded flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#37474f] mb-2 text-lg">Real-time Sync</h3>
            <p className="text-sm text-[#6b7c87]">
              Instant updates as users share their locations and make selections
            </p>
          </div>
          
          <div className="bg-white border border-[#d0d0d0] rounded p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5dade2] to-[#03a9f4] rounded flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#37474f] mb-2 text-lg">Smart Midpoint</h3>
            <p className="text-sm text-[#6b7c87]">
              Calculates fair meeting points based on actual drive times
            </p>
          </div>
          
          <div className="bg-white border border-[#d0d0d0] rounded p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8bc34a] to-[#9ccc65] rounded flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#37474f] mb-2 text-lg">Private & Secure</h3>
            <p className="text-sm text-[#6b7c87]">
              No account needed. Sessions expire after 6 hours automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}