'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Loader2, ChevronDown, Plus, UtensilsCrossed, Flame } from 'lucide-react';
import { useFoodUnits } from '@/hooks/useNutritionistMealPlans';
import type { FoodUnitOption } from '@/hooks/useNutritionistMealPlans';
import type { FoodUnit } from '@/lib/api-schemas';

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
  fiber_per_100g: number | null;
  is_favorite: boolean;
}

export interface FoodAddPayload {
  food_id: string;
  quantity: number;
  unit: FoodUnit;
  // Extra data for optimistic UI update
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  // Gram equivalent for optimistic macro calculation
  gram_equivalent: number;
}

interface FoodSearchModalProps {
  mealTypeLabel: string;
  onAdd: (payload: FoodAddPayload) => void;
  onClose: () => void;
}

// ============================================================================
// Food Result Card
// ============================================================================

function FoodResultCard({
  food,
  isSelected,
  onSelect,
}: {
  food: FoodSearchResult;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-xl border text-left transition-all ${
        isSelected
          ? 'border-[#1B998B] bg-emerald-50/50 ring-1 ring-[#1B998B]'
          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
      }`}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-gray-800 truncate'>
            {food.name}
          </p>
          <p className='text-xs text-gray-400 mt-0.5'>
            Pour 100g{food.brand ? ` · ${food.brand}` : ''}{food.category ? ` · ${food.category}` : ''}
          </p>
        </div>
        <span className='px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium shrink-0'>
          {food.calories_per_100g} kcal
        </span>
      </div>
      <div className='flex gap-1.5 mt-2'>
        <span className='px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs'>
          P {food.protein_per_100g}g
        </span>
        <span className='px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs'>
          G {food.carbs_per_100g}g
        </span>
        <span className='px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs'>
          L {food.fat_per_100g}g
        </span>
        {food.fiber_per_100g != null && (
          <span className='px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs'>
            Fi {food.fiber_per_100g}g
          </span>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// Component
// ============================================================================

export function FoodSearchModal({ mealTypeLabel, onAdd, onClose }: FoodSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState<FoodUnitOption>({ unit: 'g', label: 'grammes', gram_equivalent: 1 });
  const inputRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const selectedRef = useRef<HTMLDivElement>(null);

  // Fetch available units for the selected food
  const { data: availableUnits, isLoading: unitsLoading } = useFoodUnits(selectedFood?.id || null);

  // Reset unit to 'g' when food changes
  useEffect(() => {
    setSelectedUnit({ unit: 'g', label: 'grammes', gram_equivalent: 1 });
  }, [selectedFood?.id]);

  // Auto-focus search input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/protected/foods/search?q=${encodeURIComponent(query)}&limit=20`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.data?.foods || data.foods || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Scroll to selected food panel and focus quantity
  useEffect(() => {
    if (selectedFood) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        quantityRef.current?.select();
      }, 100);
    }
  }, [selectedFood?.id]);

  // Convert quantity to gram-equivalent for macro calculation
  const gramEquivalentQty = useMemo(() => {
    return quantity * selectedUnit.gram_equivalent;
  }, [quantity, selectedUnit]);

  // Scaled macros based on gram-equivalent quantity
  const scaledMacros = useMemo(() => {
    if (!selectedFood || quantity <= 0) return null;
    return {
      calories: Math.round((selectedFood.calories_per_100g * gramEquivalentQty) / 100),
      protein: Math.round(((selectedFood.protein_per_100g * gramEquivalentQty) / 100) * 10) / 10,
      carbs: Math.round(((selectedFood.carbs_per_100g * gramEquivalentQty) / 100) * 10) / 10,
      fat: Math.round(((selectedFood.fat_per_100g * gramEquivalentQty) / 100) * 10) / 10,
      fiber: selectedFood.fiber_per_100g != null
        ? Math.round(((selectedFood.fiber_per_100g * gramEquivalentQty) / 100) * 10) / 10
        : null,
    };
  }, [selectedFood, quantity, gramEquivalentQty]);

  function handleAdd() {
    if (!selectedFood || quantity <= 0) return;
    onAdd({
      food_id: selectedFood.id,
      quantity,
      unit: selectedUnit.unit,
      name: selectedFood.name,
      calories_per_100g: selectedFood.calories_per_100g,
      protein_per_100g: selectedFood.protein_per_100g,
      carbs_per_100g: selectedFood.carbs_per_100g,
      fat_per_100g: selectedFood.fat_per_100g,
      gram_equivalent: selectedUnit.gram_equivalent,
    });
  }

  function handleSelectUnit(unit: FoodUnitOption) {
    setSelectedUnit(unit);
    // Set sensible default quantity for the unit
    if (unit.unit === 'g') setQuantity(100);
    else if (unit.unit === 'ml') setQuantity(250);
    else setQuantity(1);
  }

  // Handle Enter key on quantity input
  function handleQuantityKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && selectedFood && quantity > 0) {
      e.preventDefault();
      handleAdd();
    }
  }

  // Units to display (default to just grams if not loaded yet)
  const units: FoodUnitOption[] = availableUnits || [{ unit: 'g', label: 'grammes', gram_equivalent: 1 }];

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='p-5 border-b border-gray-100'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center'>
                <UtensilsCrossed className='w-4.5 h-4.5 text-[#1B998B]' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Ajouter un aliment
                </h3>
                <p className='text-xs text-gray-500'>
                  {mealTypeLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              ref={inputRef}
              type='text'
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedFood(null); }}
              placeholder='Rechercher un aliment (base CIQUAL)...'
              className='w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm bg-gray-50'
            />
            {loading && (
              <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#1B998B]' />
            )}
          </div>
        </div>

        {/* Results */}
        <div className='flex-1 overflow-y-auto p-4 min-h-0'>
          {results.length > 0 && !selectedFood && (
            <p className='text-xs text-gray-500 mb-3'>
              {results.length} résultat{results.length > 1 ? 's' : ''} pour &quot;{query}&quot;
            </p>
          )}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className='text-center py-10'>
              <Search className='w-8 h-8 text-gray-200 mx-auto mb-3' />
              <p className='text-sm text-gray-500'>
                Aucun résultat pour &quot;{query}&quot;
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Essayez avec un autre terme de recherche
              </p>
            </div>
          )}
          {query.length < 2 && !loading && (
            <div className='text-center py-10'>
              <Search className='w-8 h-8 text-gray-200 mx-auto mb-3' />
              <p className='text-sm text-gray-500'>
                Tapez au moins 2 caractères pour rechercher
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Recherche dans la base CIQUAL ({'>'}3000 aliments)
              </p>
            </div>
          )}
          <div className='space-y-2'>
            {results.map(food => (
              <FoodResultCard
                key={food.id}
                food={food}
                isSelected={selectedFood?.id === food.id}
                onSelect={() => { setSelectedFood(food); setQuantity(100); }}
              />
            ))}
          </div>

          {/* Selected food configuration panel - inline */}
          {selectedFood && (
            <div ref={selectedRef} className='mt-3 bg-emerald-50/60 border border-[#1B998B]/20 rounded-xl p-4'>
              <div className='flex items-center gap-2 mb-3'>
                <Flame className='w-4 h-4 text-[#1B998B]' />
                <p className='text-sm font-medium text-gray-800 truncate flex-1'>
                  {selectedFood.name}
                </p>
              </div>

              {/* Quantity + Unit row */}
              <div className='flex items-center gap-2 mb-3'>
                <label className='text-xs text-gray-500 shrink-0'>Quantité</label>
                <input
                  ref={quantityRef}
                  type='number'
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value) || 0)}
                  onKeyDown={handleQuantityKeyDown}
                  min={1}
                  className='w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] text-sm bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                />
                <div className='relative flex-1'>
                  <select
                    value={selectedUnit.unit}
                    onChange={e => {
                      const u = units.find(u => u.unit === e.target.value);
                      if (u) handleSelectUnit(u);
                    }}
                    className='w-full appearance-none pl-3 pr-7 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] text-sm bg-white cursor-pointer'
                  >
                    {units.map(u => (
                      <option key={u.unit} value={u.unit}>{u.label}</option>
                    ))}
                  </select>
                  {unitsLoading ? (
                    <Loader2 className='absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B998B] animate-spin pointer-events-none' />
                  ) : (
                    <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none' />
                  )}
                </div>
              </div>

              {/* Gram equivalent hint */}
              {selectedUnit.unit !== 'g' && gramEquivalentQty > 0 && (
                <p className='text-xs text-gray-400 mb-3'>
                  = {Math.round(gramEquivalentQty * 10) / 10} g
                </p>
              )}

              {/* Macro preview */}
              {scaledMacros && (
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-medium'>
                    {scaledMacros.calories} kcal
                  </span>
                  <span className='px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium'>
                    P {scaledMacros.protein}g
                  </span>
                  <span className='px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium'>
                    G {scaledMacros.carbs}g
                  </span>
                  <span className='px-2 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium'>
                    L {scaledMacros.fat}g
                  </span>
                  {scaledMacros.fiber != null && (
                    <span className='px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium'>
                      Fi {scaledMacros.fiber}g
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Add button */}
        {selectedFood && (
          <div className='p-4 border-t border-gray-100'>
            <button
              onClick={handleAdd}
              disabled={quantity <= 0}
              className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors text-sm disabled:opacity-50'
            >
              <Plus className='w-4 h-4' />
              Ajouter au repas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
