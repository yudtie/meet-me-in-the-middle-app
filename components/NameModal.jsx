'use client';
import { useState } from 'react';

export default function NameModal({ isOpen, onSubmit, onCancel }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#d0d0d0] rounded shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-[#37474f] mb-4">What's your name?</h2>
        <p className="text-[#6b7c87] mb-6">
          Let your friend know who they're meeting!
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-white border border-[#d0d0d0] text-[#37474f] rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-transparent placeholder-gray-400"
            autoFocus
            maxLength={30}
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white hover:bg-gray-50 border border-[#d0d0d0] text-[#37474f] py-3 rounded transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] hover:from-[#7cb342] hover:to-[#8bc34a] text-white py-3 rounded disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md font-medium"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}