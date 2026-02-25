'use client';
import { useState } from 'react';

// UPDATED: category picker only shown to first user (isFirstUser prop)
const CATEGORY_OPTIONS = [
  { id: 'dining', label: '🍽️ Food & Cafes', mapboxCategories: ['restaurant', 'cafe', 'fast_food', 'bakery', 'pizza'] },
  { id: 'bars', label: '🍺 Bars & Pubs', mapboxCategories: ['bar', 'pub', 'nightclub', 'brewery', 'wine_bar'] },
  { id: 'gas', label: '⛽ Gas Stations', mapboxCategories: ['gas_station', 'fuel'] },
  { id: 'grocery', label: '🛒 Grocery Stores', mapboxCategories: ['grocery', 'supermarket', 'food_and_drink_store'] },
  { id: 'coffee', label: '☕ Coffee Shops', mapboxCategories: ['coffee_shop', 'cafe', 'coffee'] },
  { id: 'parks', label: '🌳 Parks & Outdoors', mapboxCategories: ['park', 'playground', 'nature'] },
  { id: 'bookstores', label: '📚 Book Stores', mapboxCategories: ['book_store', 'bookstore'] },
  { id: 'shopping', label: '🛍️ Shopping', mapboxCategories: ['shopping_mall', 'retail', 'department_store'] },
  { id: 'golf', label: '⛳ Golf Courses', mapboxCategories: ['golf_course', 'country_club'] },
];

export default function NameModal({ isOpen, onSubmit, onCancel, isFirstUser }) {
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['dining']);

  const toggleCategory = (id) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        // Don't allow deselecting if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== id);
      } else {
        if (prev.length >= 4) return prev; // max 4
        return [...prev, id];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && (isFirstUser ? selectedCategories.length > 0 : true)) {
      onSubmit(name.trim(), isFirstUser ? selectedCategories : null);
      setName('');
      setSelectedCategories(['dining']);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#d0d0d0] rounded shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#37474f] mb-2">What's your name?</h2>
        <p className="text-[#6b7c87] mb-4">
          Let your {isFirstUser ? 'friends' : 'friend'} know who they're meeting!
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            autoComplete="new-password"
            className="w-full bg-white border border-[#d0d0d0] text-[#37474f] rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-transparent placeholder-gray-400"
            autoFocus
            maxLength={30}
          />

          {/* Category Selection — first user only */}
          {isFirstUser && (
            <div className="mb-6">
              <p className="font-semibold text-[#37474f] mb-1">What kind of place are you looking for?</p>
              <p className="text-xs text-[#6b7c87] mb-3">Pick up to 4 — you're setting this for the whole group</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map(cat => {
                  const isSelected = selectedCategories.includes(cat.id);
                  const isDisabled = !isSelected && selectedCategories.length >= 4;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      disabled={isDisabled}
                      className={`px-3 py-2.5 rounded border text-sm font-medium transition-all text-left ${
                        isSelected
                          ? 'bg-green-50 border-[#8bc34a] text-[#37474f]'
                          : isDisabled
                          ? 'bg-gray-50 border-[#d0d0d0] text-gray-400 cursor-not-allowed'
                          : 'bg-white border-[#d0d0d0] text-[#37474f] hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                      {isSelected && <span className="float-right text-[#8bc34a]">✓</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#6b7c87] mt-2">{selectedCategories.length}/4 selected</p>
            </div>
          )}

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
              {isFirstUser ? "Let's Meet!" : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}