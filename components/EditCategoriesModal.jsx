'use client';
import { useState } from 'react';

const CATEGORY_OPTIONS = [
  { id: 'dining', label: '🍽️ Food & Cafes' },
  { id: 'bars', label: '🍺 Bars & Pubs' },
  { id: 'gas', label: '⛽ Gas Stations' },
  { id: 'grocery', label: '🛒 Grocery Stores' },
  { id: 'coffee', label: '☕ Coffee Shops' },
  { id: 'parks', label: '🌳 Parks & Outdoors' },
  { id: 'bookstores', label: '📚 Book Stores' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'golf', label: '⛳ Golf Courses' },
];

export default function EditCategoriesModal({ isOpen, currentCategories, onSave, onCancel }) {
  const [selected, setSelected] = useState(currentCategories || ['dining']);

  const toggle = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== id);
      } else {
        if (prev.length >= 4) return prev;
        return [...prev, id];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#d0d0d0] rounded shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-[#37474f] mb-2">Edit Categories</h2>
        <p className="text-[#6b7c87] mb-4 text-sm">
          Update what kind of places you're looking for. This will recalculate venues for the whole group.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {CATEGORY_OPTIONS.map(cat => {
            const isSelected = selected.includes(cat.id);
            const isDisabled = !isSelected && selected.length >= 4;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(cat.id)}
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
        <p className="text-xs text-[#6b7c87] mb-6">{selected.length}/4 selected</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white hover:bg-gray-50 border border-[#d0d0d0] text-[#37474f] py-3 rounded transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(selected)}
            disabled={selected.length === 0}
            className="flex-1 bg-gradient-to-r from-[#8bc34a] to-[#9ccc65] hover:from-[#7cb342] hover:to-[#8bc34a] text-white py-3 rounded disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md font-medium"
          >
            Recalculate Venues
          </button>
        </div>
      </div>
    </div>
  );
}