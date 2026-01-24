'use client';

import React from 'react';
import { Search, Heart, Sparkles, ShoppingCart } from 'lucide-react';
import type { RecipesTab } from '@/types/recipes';

interface RecipesTabsProps {
  activeTab: RecipesTab;
  onTabChange: (tab: RecipesTab) => void;
  favoritesCount?: number;
}

const tabs: { id: RecipesTab; label: string; icon: React.ReactNode }[] = [
  { id: 'discover', label: 'Découvrir', icon: <Search className="w-4 h-4" /> },
  { id: 'favorites', label: 'Favoris', icon: <Heart className="w-4 h-4" /> },
  { id: 'recommended', label: 'Pour vous', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'shopping', label: 'Courses', icon: <ShoppingCart className="w-4 h-4" /> },
];

export function RecipesTabs({ activeTab, onTabChange, favoritesCount }: RecipesTabsProps) {
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

export default RecipesTabs;
