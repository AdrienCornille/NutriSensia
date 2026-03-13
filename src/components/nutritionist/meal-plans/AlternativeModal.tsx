'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Loader2, Trash2, Plus, RefreshCw } from 'lucide-react';
import {
  useAlternatives,
  useAddAlternative,
  useDeleteAlternative,
} from '@/hooks/useNutritionistMealPlans';
import { decodeHtmlEntities } from '@/lib/utils';
import type { MealPlanFood, MealPlanAlternative } from '@/types/nutritionist-dossier';

// ============================================================================
// Types
// ============================================================================

interface FoodSearchResult {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

interface AlternativeModalProps {
  patientId: string;
  planId: string;
  mealId: string;
  food: MealPlanFood;
  onClose: () => void;
}

// ============================================================================
// Alternative Card
// ============================================================================

function AlternativeCard({
  alt,
  onDelete,
  deleting,
}: {
  alt: MealPlanAlternative;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg group'>
      <div className='w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium shrink-0'>
        {alt.preference_order + 1}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-gray-800 truncate'>
          {alt.alternative_name}
        </p>
        {alt.reason && (
          <p className='text-xs text-gray-500 truncate'>{alt.reason}</p>
        )}
      </div>
      <div className='flex items-center gap-3 text-xs shrink-0'>
        <span className='text-gray-600'>{alt.calories} kcal</span>
        <span className='text-blue-600'>{alt.protein_g}g P</span>
        <span className='text-amber-600'>{alt.carbs_g}g G</span>
        <span className='text-rose-600'>{alt.fat_g}g L</span>
      </div>
      <button
        onClick={onDelete}
        disabled={deleting}
        className='p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all disabled:opacity-50'
        title='Supprimer'
      >
        <Trash2 className='w-3.5 h-3.5' />
      </button>
    </div>
  );
}

// ============================================================================
// Main Modal
// ============================================================================

export function AlternativeModal({
  patientId,
  planId,
  mealId,
  food,
  onClose,
}: AlternativeModalProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [reason, setReason] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: alternatives, isLoading } = useAlternatives(
    patientId,
    planId,
    mealId,
    food.id
  );
  const addAlternative = useAddAlternative(patientId, planId);
  const deleteAlternative = useDeleteAlternative(patientId, planId);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-focus search when opened
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/protected/foods/search?q=${encodeURIComponent(query)}&limit=15`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.data?.foods || data.foods || []);
        }
      } catch {
        // silently fail
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Macro comparison helper
  const originalMacros = useMemo(
    () => ({
      calories: food.calories || 0,
      protein: food.protein_g || 0,
      carbs: food.carbs_g || 0,
      fat: food.fat_g || 0,
    }),
    [food]
  );

  function handleSelectAlternative(result: FoodSearchResult) {
    addAlternative.mutate(
      {
        mealId,
        foodItemId: food.id,
        alternative_food_id: result.id,
        reason: reason || undefined,
        quantity: food.quantity,
      },
      {
        onSuccess: () => {
          setQuery('');
          setResults([]);
          setReason('');
          setShowSearch(false);
        },
      }
    );
  }

  function handleDeleteAlt(alt: MealPlanAlternative) {
    deleteAlternative.mutate({
      mealId,
      foodItemId: food.id,
      alternativeId: alt.id,
    });
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-5 border-b border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>
                Alternatives
              </h3>
              <p className='text-xs text-gray-500 mt-0.5'>
                Équivalences pour cet aliment
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Original food info */}
          <div className='bg-emerald-50 rounded-lg p-3'>
            <div className='flex items-center gap-2 mb-1'>
              <RefreshCw className='w-4 h-4 text-emerald-600' />
              <span className='text-sm font-medium text-emerald-800'>
                Aliment original
              </span>
            </div>
            <p className='text-sm text-gray-800 font-medium'>
              {decodeHtmlEntities(food.custom_name || '') || 'Aliment'}
            </p>
            <div className='flex gap-3 mt-1 text-xs'>
              <span className='text-gray-600'>
                {food.quantity}
                {food.unit} &middot; {originalMacros.calories} kcal
              </span>
              <span className='text-blue-600'>P:{originalMacros.protein}g</span>
              <span className='text-amber-600'>G:{originalMacros.carbs}g</span>
              <span className='text-rose-600'>L:{originalMacros.fat}g</span>
            </div>
          </div>
        </div>

        {/* Alternatives list */}
        <div className='flex-1 overflow-y-auto p-4 min-h-0'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
            </div>
          ) : (alternatives || []).length === 0 && !showSearch ? (
            <div className='text-center py-8'>
              <RefreshCw className='w-8 h-8 text-gray-300 mx-auto mb-2' />
              <p className='text-sm text-gray-500'>
                Aucune alternative configurée
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Ajoutez des équivalences pour que le patient puisse substituer
                cet aliment
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              {(alternatives || []).map(alt => (
                <AlternativeCard
                  key={alt.id}
                  alt={alt}
                  onDelete={() => handleDeleteAlt(alt)}
                  deleting={deleteAlternative.isPending}
                />
              ))}
            </div>
          )}

          {/* Search section */}
          {showSearch && (
            <div className='mt-4 border-t border-gray-100 pt-4'>
              <div className='mb-3'>
                <label className='text-xs font-medium text-gray-600 mb-1 block'>
                  Raison de la substitution (optionnel)
                </label>
                <input
                  type='text'
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder='Ex: allergie au gluten, végétarien...'
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]'
                />
              </div>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  ref={inputRef}
                  type='text'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='Rechercher un aliment alternatif...'
                  className='w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] text-sm'
                />
                {searching && (
                  <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400' />
                )}
              </div>

              {/* Search results */}
              <div className='mt-3 space-y-1.5 max-h-48 overflow-y-auto'>
                {query.length >= 2 && !searching && results.length === 0 && (
                  <p className='text-xs text-gray-400 text-center py-4'>
                    Aucun résultat
                  </p>
                )}
                {results.map(result => {
                  const scaledCals = Math.round(
                    (result.calories_per_100g * food.quantity) / 100
                  );
                  const diff = scaledCals - originalMacros.calories;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelectAlternative(result)}
                      disabled={addAlternative.isPending}
                      className='w-full p-2.5 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-all disabled:opacity-50'
                    >
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium text-gray-800 truncate flex-1'>
                          {result.name}
                        </p>
                        <div className='flex items-center gap-2 ml-2 shrink-0'>
                          <span className='text-xs text-gray-600'>
                            {scaledCals} kcal
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              Math.abs(diff) <= 20
                                ? 'text-emerald-600'
                                : diff > 0
                                  ? 'text-amber-600'
                                  : 'text-blue-600'
                            }`}
                          >
                            {diff > 0 ? '+' : ''}
                            {diff} kcal
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-3 mt-1 text-xs'>
                        <span className='text-blue-600'>
                          P:{Math.round((result.protein_per_100g * food.quantity) / 100 * 10) / 10}g
                        </span>
                        <span className='text-amber-600'>
                          G:{Math.round((result.carbs_per_100g * food.quantity) / 100 * 10) / 10}g
                        </span>
                        <span className='text-rose-600'>
                          L:{Math.round((result.fat_per_100g * food.quantity) / 100 * 10) / 10}g
                        </span>
                        <span className='text-gray-400'>
                          pour {food.quantity}
                          {food.unit}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-100 flex justify-between'>
          {!showSearch ? (
            <button
              onClick={() => setShowSearch(true)}
              className='flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors text-sm'
            >
              <Plus className='w-4 h-4' />
              Ajouter une alternative
            </button>
          ) : (
            <button
              onClick={() => {
                setShowSearch(false);
                setQuery('');
                setResults([]);
                setReason('');
              }}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Annuler la recherche
            </button>
          )}
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors'
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
