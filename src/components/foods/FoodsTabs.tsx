'use client';

import React from 'react';
import { Search, Heart } from 'lucide-react';

export type FoodsTab = 'all' | 'favorites';

interface FoodsTabsProps {
  activeTab: FoodsTab;
  onTabChange: (tab: FoodsTab) => void;
  favoritesCount?: number;
}

const tabs: { id: FoodsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Tous les aliments', icon: <Search className="w-4 h-4" /> },
  { id: 'favorites', label: 'Favoris', icon: <Heart className="w-4 h-4" /> },
];

export function FoodsTabs({ activeTab, onTabChange, favoritesCount }: FoodsTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'favorites' && favoritesCount !== undefined && favoritesCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FoodsTabs;
