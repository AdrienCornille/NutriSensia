'use client';

import React from 'react';
import {
  Eye,
  Heart,
  Star,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
} from 'lucide-react';
import { useRecipeStats } from '@/hooks/useNutritionistRecipes';

interface RecipeStatsPanelProps {
  onOpenRecipe?: (recipeId: string) => void;
}

export function RecipeStatsPanel({ onOpenRecipe }: RecipeStatsPanelProps) {
  const { data: stats, isLoading } = useRecipeStats();

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-center py-8'>
          <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
        </div>
      </div>
    );
  }

  if (!stats || stats.totalRecipes === 0) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6 text-center'>
        <BarChart3 className='w-10 h-10 text-gray-300 mx-auto mb-3' />
        <p className='text-sm text-gray-500'>
          Les statistiques apparaîtront quand vous aurez des recettes publiées
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Recettes',
      value: stats.totalRecipes,
      sub: `${stats.publishedRecipes} publiées`,
      icon: ChefHat,
      color: 'text-[#1B998B]',
    },
    {
      label: 'Vues',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      label: 'Favoris',
      value: stats.totalFavorites,
      icon: Heart,
      color: 'text-red-500',
    },
    {
      label: 'Note moyenne',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-',
      sub: `${stats.totalRatings} avis`,
      icon: Star,
      color: 'text-amber-500',
    },
    {
      label: 'Cuisinées',
      value: stats.totalCooked,
      icon: UtensilsCrossed,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className='space-y-4'>
      {/* Stats cards */}
      <div className='grid grid-cols-2 lg:grid-cols-5 gap-3'>
        {statCards.map(card => (
          <div
            key={card.label}
            className='bg-white rounded-xl border border-gray-200 p-4'
          >
            <div className='flex items-center gap-2 mb-1'>
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className='text-xs text-gray-500'>{card.label}</span>
            </div>
            <p className='text-xl font-bold text-gray-900'>{card.value}</p>
            {card.sub && <p className='text-xs text-gray-400'>{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Top lists */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Most popular */}
        {stats.mostPopular.length > 0 && (
          <div className='bg-white rounded-xl border border-gray-200 p-4'>
            <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <Eye className='w-4 h-4 text-blue-500' />
              Les plus vues
            </h4>
            <div className='space-y-2'>
              {stats.mostPopular.map((recipe, idx) => (
                <div key={recipe.id} className='flex items-center gap-3'>
                  <span className='text-xs font-medium text-gray-400 w-5'>
                    {idx + 1}.
                  </span>
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt=''
                      className='w-8 h-8 rounded-lg object-cover'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center'>
                      <ChefHat className='w-4 h-4 text-gray-400' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <button
                      onClick={() => onOpenRecipe?.(recipe.id)}
                      className='text-sm text-gray-800 truncate hover:text-[#1B998B] transition-colors text-left'
                    >
                      {recipe.title}
                    </button>
                  </div>
                  <span className='text-xs text-gray-500'>
                    {recipe.views} vues
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best rated */}
        {stats.bestRated.length > 0 && (
          <div className='bg-white rounded-xl border border-gray-200 p-4'>
            <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <Star className='w-4 h-4 text-amber-500' />
              Mieux notées
            </h4>
            <div className='space-y-2'>
              {stats.bestRated.map((recipe, idx) => (
                <div key={recipe.id} className='flex items-center gap-3'>
                  <span className='text-xs font-medium text-gray-400 w-5'>
                    {idx + 1}.
                  </span>
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt=''
                      className='w-8 h-8 rounded-lg object-cover'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center'>
                      <ChefHat className='w-4 h-4 text-gray-400' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <button
                      onClick={() => onOpenRecipe?.(recipe.id)}
                      className='text-sm text-gray-800 truncate hover:text-[#1B998B] transition-colors text-left'
                    >
                      {recipe.title}
                    </button>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star className='w-3 h-3 text-amber-400 fill-amber-400' />
                    <span className='text-xs text-gray-600'>
                      {recipe.rating.toFixed(1)}
                    </span>
                    <span className='text-xs text-gray-400'>
                      ({recipe.ratingCount})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
