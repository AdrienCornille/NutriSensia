'use client';

import React from 'react';
import { RecipeCard } from './RecipeCard';
import type { NutriRecipe } from '@/types/recipes';

interface RecipesGridProps {
  recipes: (NutriRecipe & { isFavorite?: boolean })[];
  favorites: string[];
  shoppingListRecipeIds?: string[];
  cookedRecipeIds?: string[];
  onToggleFavorite: (recipeId: string) => void;
  onRecipeClick?: (recipe: NutriRecipe & { isFavorite?: boolean }) => void;
  onAddToShoppingList?: (recipe: NutriRecipe) => void;
  onLogMeal?: (recipe: NutriRecipe) => void;
  emptyMessage?: string;
  emptyIcon?: string;
  isLoading?: boolean;
}

export function RecipesGrid({
  recipes,
  favorites,
  shoppingListRecipeIds = [],
  cookedRecipeIds = [],
  onToggleFavorite,
  onRecipeClick,
  onAddToShoppingList,
  onLogMeal,
  emptyMessage = 'Aucune recette trouvée',
  emptyIcon = '🍽️',
  isLoading = false,
}: RecipesGridProps) {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

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
          isInShoppingList={shoppingListRecipeIds.includes(recipe.id)}
          isCooked={cookedRecipeIds.includes(recipe.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onRecipeClick}
          onAddToShoppingList={onAddToShoppingList}
          onLogMeal={onLogMeal}
        />
      ))}
    </div>
  );
}

export default RecipesGrid;
