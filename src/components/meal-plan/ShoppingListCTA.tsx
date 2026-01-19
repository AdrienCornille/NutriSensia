'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface ShoppingListCTAProps {
  onGenerateList: () => void;
}

export function ShoppingListCTA({ onGenerateList }: ShoppingListCTAProps) {
  return (
    <div className="bg-gradient-to-r from-[#1B998B] to-teal-500 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Liste de courses</h3>
          <p className="text-white/80 mt-1">
            Générez automatiquement votre liste de courses pour la semaine.
          </p>
        </div>
        <button
          onClick={onGenerateList}
          className="px-5 py-3 bg-white text-[#1B998B] font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Générer la liste
        </button>
      </div>
    </div>
  );
}

export default ShoppingListCTA;
