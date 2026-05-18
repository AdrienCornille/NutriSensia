'use client';

import React, { useState, useCallback } from 'react';
import {
  MoreVertical,
  Clock,
  Users,
  Star,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ChefHat,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NutriRecipe,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/types/recipes';

interface RecipeListProps {
  recipes: NutriRecipe[];
  isLoading: boolean;
  onEdit: (recipe: NutriRecipe) => void;
  onDelete: (recipe: NutriRecipe) => void;
  onPublish: (recipe: NutriRecipe) => void;
  onDuplicate: (recipe: NutriRecipe) => void;
  onAssign?: (recipe: NutriRecipe) => void;
}

export function RecipeList({
  recipes,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate,
  onAssign,
}: RecipeListProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className='text-center py-20'>
        <ChefHat className='w-16 h-16 text-gray-300 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-700 mb-2'>
          Aucune recette trouvée
        </h3>
        <p className='text-sm text-gray-500'>
          Essayez de modifier vos filtres ou créez une nouvelle recette
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
      <AnimatePresence mode='popLayout'>
        {recipes.map(recipe => (
          <motion.div
            key={recipe.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group'
          >
            {/* Image */}
            <div
              className='h-44 bg-gray-100 relative cursor-pointer'
              onClick={() => onEdit(recipe)}
            >
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <ChefHat className='w-12 h-12 text-gray-300' />
                </div>
              )}
              {/* Status badge */}
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[recipe.status]}`}
              >
                {STATUS_LABELS[recipe.status]}
              </span>
              {/* Category */}
              {recipe.category && (
                <span className='absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700'>
                  {recipe.category.emoji} {recipe.category.label}
                </span>
              )}
            </div>

            {/* Content */}
            <div className='p-4'>
              <h3
                className='font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#1B998B] transition-colors line-clamp-1'
                onClick={() => onEdit(recipe)}
              >
                {recipe.title}
              </h3>

              {/* Meta */}
              <div className='flex items-center gap-4 text-xs text-gray-500 mb-3'>
                <span className='flex items-center gap-1'>
                  <Clock className='w-3.5 h-3.5' />
                  {recipe.totalTimeMinutes} min
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[recipe.difficulty]}`}
                >
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </span>
              </div>

              {/* Nutrition quick view — per serving (compute from ingredients if needed) */}
              {(() => {
                let cal = recipe.calories;
                let prot = recipe.proteinG;
                let carb = recipe.carbsG;
                let fat = recipe.fatG;

                if (cal === null) {
                  let eCal = 0,
                    eProt = 0,
                    eCarb = 0,
                    eFat = 0;
                  let hasData = false;
                  for (const ing of recipe.ingredients) {
                    if (ing.caloriesPer100g && ing.quantityValue) {
                      const f = ing.quantityValue / 100;
                      eCal += ing.caloriesPer100g * f;
                      eProt += (ing.proteinPer100g || 0) * f;
                      eCarb += (ing.carbsPer100g || 0) * f;
                      eFat += (ing.fatPer100g || 0) * f;
                      hasData = true;
                    }
                  }
                  if (hasData) {
                    cal = eCal;
                    prot = eProt;
                    carb = eCarb;
                    fat = eFat;
                  }
                }

                if (cal === null) return null;
                const s = recipe.servings || 1;
                return (
                  <div className='flex items-center gap-3 text-xs text-gray-500 mb-3'>
                    <span className='font-medium text-gray-700'>
                      {Math.round(cal / s)} kcal
                    </span>
                    {prot !== null && <span>P: {Math.round(prot / s)}g</span>}
                    {carb !== null && <span>G: {Math.round(carb / s)}g</span>}
                    {fat !== null && <span>L: {Math.round(fat / s)}g</span>}
                  </div>
                );
              })()}

              {/* Rating + Actions */}
              <div className='flex items-center justify-between border-t border-gray-100 pt-3'>
                <div className='flex items-center gap-1'>
                  {recipe.ratingCount > 0 ? (
                    <>
                      <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                      <span className='text-sm font-medium text-gray-700'>
                        {recipe.averageRating.toFixed(1)}
                      </span>
                      <span className='text-xs text-gray-400'>
                        ({recipe.ratingCount})
                      </span>
                    </>
                  ) : (
                    <span className='text-xs text-gray-400'>
                      Pas encore noté
                    </span>
                  )}
                </div>

                {/* Actions menu */}
                <div className='relative'>
                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === recipe.id ? null : recipe.id)
                    }
                    className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <MoreVertical className='w-4 h-4 text-gray-500' />
                  </button>

                  {menuOpen === recipe.id && (
                    <>
                      <div
                        className='fixed inset-0 z-10'
                        onClick={() => setMenuOpen(null)}
                      />
                      <div className='absolute right-0 bottom-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1'>
                        <button
                          onClick={() => {
                            onEdit(recipe);
                            setMenuOpen(null);
                          }}
                          className='w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                        >
                          <Pencil className='w-4 h-4' />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            onPublish(recipe);
                            setMenuOpen(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                            recipe.status === 'draft'
                              ? 'text-[#1B998B] hover:bg-[#1B998B]/5'
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          {recipe.status === 'draft' ? (
                            <>
                              <Eye className='w-4 h-4' /> Publier
                            </>
                          ) : (
                            <>
                              <EyeOff className='w-4 h-4' /> Dé-publier
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            onDuplicate(recipe);
                            setMenuOpen(null);
                          }}
                          className='w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                        >
                          <Copy className='w-4 h-4' />
                          Dupliquer
                        </button>
                        {onAssign && recipe.status === 'published' && (
                          <button
                            onClick={() => {
                              onAssign(recipe);
                              setMenuOpen(null);
                            }}
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1B998B] hover:bg-[#1B998B]/5'
                          >
                            <Send className='w-4 h-4' />
                            Recommander
                          </button>
                        )}
                        <hr className='my-1 border-gray-100' />
                        <button
                          onClick={() => {
                            onDelete(recipe);
                            setMenuOpen(null);
                          }}
                          className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                        >
                          <Trash2 className='w-4 h-4' />
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
