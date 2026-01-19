'use client';

import React, { useCallback } from 'react';
import { Search, Camera } from 'lucide-react';
import type { FoodItem } from '@/types/meals';

interface FoodSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onBarcodeClick?: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function FoodSearchBar({
  value,
  onChange,
  onBarcodeClick,
  placeholder = 'Rechercher un aliment...',
  isLoading = false,
}: FoodSearchBarProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isLoading ? 'text-emerald-500 animate-pulse' : 'text-gray-400'
          }`}
        />
      </div>
      {onBarcodeClick && (
        <button
          onClick={onBarcodeClick}
          className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          aria-label="Scanner un code-barres"
        >
          <Camera className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Scanner</span>
        </button>
      )}
    </div>
  );
}

// Search Results Component
interface FoodSearchResultsProps {
  query: string;
  results: FoodItem[];
  isLoading: boolean;
  onSelectFood: (food: FoodItem) => void;
}

export function FoodSearchResults({
  query,
  results,
  isLoading,
  onSelectFood,
}: FoodSearchResultsProps) {
  if (!query || query.length < 2) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-xs text-gray-500 mb-3">
        {isLoading
          ? 'Recherche en cours...'
          : `Résultats pour "${query}"`}
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-gray-100 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-center py-4 text-gray-400">
          Aucun résultat trouvé
        </p>
      ) : (
        <div className="space-y-2">
          {results.map((food) => (
            <FoodSearchResultItem
              key={food.id}
              food={food}
              onSelect={() => onSelectFood(food)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual Search Result Item
interface FoodSearchResultItemProps {
  food: FoodItem;
  onSelect: () => void;
}

function FoodSearchResultItem({ food, onSelect }: FoodSearchResultItemProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-3 rounded-lg border border-gray-100 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        {food.emoji && (
          <span className="text-xl" role="img" aria-hidden="true">
            {food.emoji}
          </span>
        )}
        <div>
          <p className="font-medium text-gray-800">{food.name}</p>
          {food.brand && (
            <p className="text-xs text-gray-500">{food.brand}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-700">
          {food.caloriesPer100g} kcal
        </p>
        <p className="text-xs text-gray-500">pour 100g</p>
      </div>
    </button>
  );
}

// Recent & Favorites Grid
interface RecentFavoritesFoodsProps {
  recentFoods: FoodItem[];
  favoriteFoods?: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
}

export function RecentFavoritesFoods({
  recentFoods,
  favoriteFoods = [],
  onSelectFood,
}: RecentFavoritesFoodsProps) {
  const displayFoods = recentFoods.length > 0 ? recentFoods : favoriteFoods;

  if (displayFoods.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">Récents & Favoris</h2>
      <div className="grid grid-cols-4 gap-3">
        {displayFoods.slice(0, 8).map((food) => (
          <button
            key={food.id}
            onClick={() => onSelectFood(food)}
            className="p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center"
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {food.emoji || '🍽️'}
            </span>
            <p className="text-sm text-gray-700 mt-2 truncate">{food.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default FoodSearchBar;
