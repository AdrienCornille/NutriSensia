'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Minus,
  Plus,
  Users,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import type { NutriRecipe } from '@/types/recipes';

const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  ml: 'ml',
  c_a_s: 'c. à soupe',
  c_a_c: 'c. à café',
  tasse: 'tasse',
  portion: 'portion',
  piece: 'pièce',
  pièce: 'pièce',
  kg: 'kg',
  l: 'L',
  cl: 'cl',
  dl: 'dl',
};

function formatUnit(unit: string | null | undefined): string {
  if (!unit) return 'g';
  return UNIT_LABELS[unit] || unit;
}

interface AddToShoppingListModalProps {
  isOpen: boolean;
  recipe: NutriRecipe | null;
  onClose: () => void;
  onConfirm: (
    recipeId: string,
    servingsMultiplier: number,
    excludedIngredientIds: string[]
  ) => Promise<void>;
  isSubmitting: boolean;
}

export function AddToShoppingListModal({
  isOpen,
  recipe,
  onClose,
  onConfirm,
  isSubmitting,
}: AddToShoppingListModalProps) {
  const [servings, setServings] = useState(1);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  if (!isOpen || !recipe) return null;

  const adjustedServings = recipe.servings * servings;
  const includedCount = recipe.ingredients.length - excludedIds.size;

  const toggleIngredient = (id: string) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (excludedIds.size === 0) {
      // Exclude all
      setExcludedIds(new Set(recipe.ingredients.map(i => i.id)));
    } else {
      // Include all
      setExcludedIds(new Set());
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl max-w-md w-full mx-4 shadow-xl max-h-[85vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-5 pb-3 flex-shrink-0'>
          <h3 className='text-base font-semibold text-gray-800 flex items-center gap-2'>
            <ShoppingCart className='w-5 h-5 text-[#1B998B]' />
            Liste de courses
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full'
          >
            <X className='w-4 h-4 text-gray-400' />
          </button>
        </div>

        {/* Recipe name */}
        <p className='text-sm text-gray-600 px-5 mb-3 line-clamp-2'>
          {recipe.title}
        </p>

        {/* Portions selector */}
        <div className='px-5 mb-4'>
          <div className='flex items-center justify-center gap-4 bg-gray-50 rounded-xl py-2.5'>
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              disabled={servings <= 1}
              className='w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30'
            >
              <Minus className='w-4 h-4 text-gray-500' />
            </button>
            <div className='flex items-center gap-2 min-w-[80px] justify-center'>
              <Users className='w-4 h-4 text-[#1B998B]' />
              <span className='text-lg font-semibold text-gray-800'>
                {adjustedServings}
              </span>
              <span className='text-sm text-gray-400'>port.</span>
            </div>
            <button
              onClick={() => setServings(servings + 1)}
              className='w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors'
            >
              <Plus className='w-4 h-4 text-gray-500' />
            </button>
          </div>
        </div>

        {/* Ingredients list header */}
        <div className='flex items-center justify-between px-5 mb-2'>
          <span className='text-xs font-medium text-gray-500'>
            {includedCount} / {recipe.ingredients.length} ingrédients
            sélectionnés
          </span>
          <button
            onClick={toggleAll}
            className='text-[10px] text-[#1B998B] hover:underline font-medium'
          >
            {excludedIds.size === 0
              ? 'Tout désélectionner'
              : 'Tout sélectionner'}
          </button>
        </div>

        {/* Ingredients list */}
        <div className='flex-1 overflow-y-auto px-5 mb-4'>
          <div className='space-y-0.5'>
            {recipe.ingredients.map(ing => {
              const isIncluded = !excludedIds.has(ing.id);
              return (
                <button
                  key={ing.id}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-left transition-colors ${
                    isIncluded ? 'hover:bg-gray-50' : 'opacity-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isIncluded
                        ? 'bg-[#1B998B] border-[#1B998B]'
                        : 'border-gray-300'
                    }`}
                  >
                    {isIncluded && <Check className='w-3 h-3 text-white' />}
                  </div>
                  <span
                    className={`text-sm flex-1 ${isIncluded ? 'text-gray-700' : 'text-gray-400 line-through'}`}
                  >
                    {ing.name}
                  </span>
                  <span
                    className={`text-xs whitespace-nowrap ${isIncluded ? 'text-gray-500' : 'text-gray-300'}`}
                  >
                    {ing.quantityValue
                      ? `${Math.round(ing.quantityValue * servings)} ${formatUnit(ing.quantityUnit)}`
                      : ing.quantity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-3 p-5 pt-3 border-t border-gray-100 flex-shrink-0'>
          <button
            onClick={onClose}
            className='flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(recipe.id, servings, [...excludedIds])}
            disabled={isSubmitting || includedCount === 0}
            className='flex-1 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#1B998B]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {isSubmitting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <ShoppingCart className='w-4 h-4' />
            )}
            Ajouter ({includedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
