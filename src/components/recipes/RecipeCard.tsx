'use client';

import React from 'react';
import { Heart, Clock, Star, Flame } from 'lucide-react';
import type { Recipe } from '@/types/recipes';
import { categoryConfig } from '@/types/recipes';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onClick: (recipe: Recipe) => void;
}

export function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onClick,
}: RecipeCardProps) {
  const categoryInfo = categoryConfig[recipe.category];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id);
  };

  return (
    <div
      onClick={() => onClick(recipe)}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-200">
        {recipe.image.startsWith('http') ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <span className="text-4xl">{categoryInfo.emoji}</span>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Category badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700">
          {categoryInfo.emoji} {categoryInfo.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {recipe.title}
        </h3>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.time}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {recipe.rating}
          </span>
        </div>

        {/* Nutrition info */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs">
            <Flame className="w-3 h-3" />
            {recipe.calories} kcal
          </span>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs">
            {recipe.protein}g prot
          </span>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeCard;
