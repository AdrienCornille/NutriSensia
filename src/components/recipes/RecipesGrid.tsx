'use client';

import React from 'react';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/types/recipes';

interface RecipesGridProps {
  recipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (recipeId: string) => void;
  onRecipeClick: (recipe: Recipe) => void;
  emptyMessage?: string;
  emptyIcon?: string;
}

export function RecipesGrid({
  recipes,
  favorites,
  onToggleFavorite,
  onRecipeClick,
  emptyMessage = 'Aucune recette trouvée',
  emptyIcon = '🍽️',
}: RecipesGridProps) {
  if (recipes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4'>
        <span className='text-5xl mb-4'>{emptyIcon}</span>
        <p className='text-gray-500 text-center'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-4 p-4'>
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          isFavorite={favorites.includes(recipe.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onRecipeClick}
        />
      ))}
    </div>
  );
}

export default RecipesGrid;
