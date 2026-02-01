'use client';
import { useState, useEffect } from 'react';

export default function PrivacyNotice() {
  const [accepted, setAccepted] = useState(true); // Start as true to avoid flash

  useEffect(() => {
    // Check if user already accepted
    const hasAccepted = localStorage.getItem('privacy-accepted') === 'true';
    setAccepted(hasAccepted);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy-accepted', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#8bc34a] shadow-xl p-4 z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-[#37474f]">
          <strong>Privacy Notice:</strong> We temporarily store your location to calculate meeting points. 
          Data is deleted after 6 hours. We don't sell or share your information.{' '}
          <a href="/privacy" className="text-[#8bc34a] hover:underline font-medium">Learn more</a>
        </div>
        <button
          onClick={handleAccept}
          className="bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] hover:from-[#7cb342] hover:to-[#8bc34a] text-white px-6 py-2 rounded font-medium whitespace-nowrap shadow-md hover:shadow-lg transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
}