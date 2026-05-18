'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Loader2,
  ChevronDown,
  Plus,
  UtensilsCrossed,
  Flame,
  Check,
} from 'lucide-react';
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
  addButtonLabel?: string;
  onFoodCreated?: (name: string) => void;
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
            Pour 100g{food.brand ? ` · ${food.brand}` : ''}
            {food.category ? ` · ${food.category}` : ''}
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
// Create Custom Food Form (inline)
// ============================================================================

const ALLERGEN_OPTIONS = [
  { value: 'gluten', label: 'Gluten', emoji: '🌾' },
  { value: 'lactose', label: 'Lactose', emoji: '🥛' },
  { value: 'oeuf', label: 'Œuf', emoji: '🥚' },
  { value: 'arachide', label: 'Arachide', emoji: '🥜' },
  { value: 'fruits-a-coque', label: 'Fruits à coque', emoji: '🌰' },
  { value: 'poisson-crustace', label: 'Poisson / crustacé', emoji: '🐟' },
  { value: 'soja', label: 'Soja', emoji: '🫘' },
] as const;

function guessAllergensFromName(name: string): string[] {
  const n = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const result: string[] = [];
  if (
    /ble\b|seigle|orge|avoine|epeautre|farine(?!.*riz)|pain\b|pates\b|biscuit|gateau|crepe|brioche|croissant|pizza|couscous|boulgour|semoul|seitan/.test(
      n
    ) &&
    !/sans gluten|riz|mais\b|quinoa|sarrasin/.test(n)
  )
    result.push('gluten');
  if (
    /^lait\b|^beurre\b|fromage|yaourt|creme fraiche|gruyere|emmental|mozzarella|parmesan|raclette|mascarpone|ricotta|feta/.test(
      n
    ) &&
    !/sans lactose|lait de coco|lait d.amande|lait de soja|vegetal/.test(n)
  )
    result.push('lactose');
  if (/^oeuf|^oeufs|\boeuf\b|\boeufs\b|omelette|mayonnaise|meringue/.test(n))
    result.push('oeuf');
  if (/arachide|cacahuete|beurre de cacah/.test(n)) result.push('arachide');
  if (
    /noix\b(?!.*coco|.*muscade)|noisette|amande\b|pistache|pecan|cajou|macadamia/.test(
      n
    )
  )
    result.push('fruits-a-coque');
  if (
    /saumon|thon|cabillaud|sardine|crevette|crabe|homard|huitre|moule\b|calamar|surimi/.test(
      n
    )
  )
    result.push('poisson-crustace');
  if (/soja|tofu|tempeh|edamame|miso\b/.test(n)) result.push('soja');
  return result;
}

const ORIGIN_OPTIONS = [
  { value: 'plant', label: 'Végétal', emoji: '🌱' },
  { value: 'animal', label: 'Viande / volaille', emoji: '🥩' },
  { value: 'fish', label: 'Poisson', emoji: '🐟' },
  { value: 'seafood', label: 'Fruits de mer', emoji: '🦐' },
  { value: 'egg', label: 'Œuf', emoji: '🥚' },
  { value: 'dairy', label: 'Produit laitier', emoji: '🥛' },
  { value: 'mixed', label: 'Mixte / composé', emoji: '🍱' },
] as const;

function guessOriginFromName(name: string): string {
  const n = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (
    /saumon|thon|cabillaud|sardine|truite|merlu|maquereau|dorade|anchois|hareng|morue|colin|bar\b|sole\b/.test(
      n
    )
  )
    return 'fish';
  if (
    /crevette|crabe|homard|langouste|huitre|moule\b|calamar|poulpe|gambas/.test(
      n
    )
  )
    return 'seafood';
  if (/^oeuf|^oeufs|\boeuf\b|\boeufs\b|omelette/.test(n)) return 'egg';
  if (
    /^lait\b|^beurre\b|fromage|yaourt|creme fraiche|gruyere|emmental|mozzarella|parmesan/.test(
      n
    )
  )
    return 'dairy';
  if (
    /poulet|dinde|canard|boeuf|veau|porc|agneau|jambon|saucisse|steak|escalope|bacon|viande|volaille/.test(
      n
    )
  )
    return 'animal';
  if (
    /tomate|carotte|courgette|oignon|ail\b|riz\b|huile|sel\b|poivre|sucre|farine|lentille|pois|quinoa|avocat|banane|pomme\b|brocoli|epinard|champignon|olive|paprika|curcuma|gingembre/.test(
      n
    )
  )
    return 'plant';
  return '';
}

function CreateFoodForm({
  defaultName,
  onCreated,
}: {
  defaultName: string;
  onCreated: (food: FoodSearchResult) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [originType, setOriginType] = useState(() =>
    guessOriginFromName(defaultName)
  );
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(() =>
    guessAllergensFromName(defaultName)
  );
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length >= 2 && calories !== '' && !!originType;

  // Re-guess origin + allergens when name changes (only if user hasn't manually selected)
  const [userOverrodeOrigin, setUserOverrodeOrigin] = useState(false);
  const [userOverrodeAllergens, setUserOverrodeAllergens] = useState(false);
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!userOverrodeOrigin) {
      const guessed = guessOriginFromName(newName);
      if (guessed) setOriginType(guessed);
    }
    if (!userOverrodeAllergens) {
      setSelectedAllergens(guessAllergensFromName(newName));
    }
  };

  const toggleAllergen = (value: string) => {
    setUserOverrodeAllergens(true);
    setSelectedAllergens(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/protected/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          origin_type: originType,
          allergens: selectedAllergens,
          calories: parseFloat(calories) || 0,
          proteins: parseFloat(protein) || 0,
          carbohydrates: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          fiber: fiber ? parseFloat(fiber) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erreur lors de la création');
        return;
      }
      const created = json.data;
      onCreated({
        id: created.id,
        name: created.name,
        brand: null,
        category: 'Personnalisé',
        calories_per_100g: created.calories_per_100g,
        protein_per_100g: created.protein_per_100g,
        carbs_per_100g: created.carbs_per_100g,
        fat_per_100g: created.fat_per_100g,
        fiber_per_100g: created.fiber_per_100g,
        is_favorite: false,
      });
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 space-y-3'>
      <p className='text-sm font-medium text-gray-800'>
        Créer un nouvel ingrédient
      </p>
      <p className='text-xs text-gray-500'>
        Cet ingrédient sera ajouté à votre base de données et pourra être
        réutilisé.
      </p>

      {/* Name */}
      <div>
        <label className='text-xs font-medium text-gray-600 mb-1 block'>
          Nom <span className='text-red-400'>*</span>
        </label>
        <input
          type='text'
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Nom de l'ingrédient"
          className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
          maxLength={200}
        />
      </div>

      {/* Origin type */}
      <div>
        <label className='text-xs font-medium text-gray-600 mb-1 block'>
          Type d&apos;aliment <span className='text-red-400'>*</span>
        </label>
        <div className='grid grid-cols-4 gap-1.5'>
          {ORIGIN_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type='button'
              onClick={() => {
                setOriginType(opt.value);
                setUserOverrodeOrigin(true);
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                originType === opt.value
                  ? 'bg-[#1B998B]/10 border-[#1B998B]/40 text-[#1B998B]'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>{opt.emoji}</span>
              <span className='truncate'>{opt.label}</span>
            </button>
          ))}
        </div>
        {!originType && (
          <p className='text-[10px] text-red-400 mt-1'>
            Veuillez sélectionner le type d&apos;aliment
          </p>
        )}
      </div>

      {/* Nutrition per 100g */}
      {/* Allergens */}
      <div>
        <label className='text-xs font-medium text-gray-600 mb-1 block'>
          Contient des allergenes ?
        </label>
        <div className='flex flex-wrap gap-1.5'>
          {ALLERGEN_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type='button'
              onClick={() => toggleAllergen(opt.value)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                selectedAllergens.includes(opt.value)
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
        <p className='text-[10px] text-gray-400 mt-1'>
          {selectedAllergens.length === 0
            ? 'Aucun allergène — cliquez pour en ajouter si nécessaire'
            : `${selectedAllergens.length} allergène${selectedAllergens.length > 1 ? 's' : ''} sélectionné${selectedAllergens.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Nutrition per 100g */}
      <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
        Valeurs nutritionnelles pour 100g
      </p>
      <div className='grid grid-cols-5 gap-2'>
        <div>
          <label className='text-[10px] text-gray-500 mb-0.5 block'>
            kcal <span className='text-red-400'>*</span>
          </label>
          <input
            type='number'
            value={calories}
            onChange={e => setCalories(e.target.value)}
            placeholder='0'
            min={0}
            className='w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1B998B] text-center'
          />
        </div>
        <div>
          <label className='text-[10px] text-blue-600 mb-0.5 block'>
            Prot. (g)
          </label>
          <input
            type='number'
            value={protein}
            onChange={e => setProtein(e.target.value)}
            placeholder='0'
            min={0}
            step={0.1}
            className='w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 text-center'
          />
        </div>
        <div>
          <label className='text-[10px] text-amber-600 mb-0.5 block'>
            Gluc. (g)
          </label>
          <input
            type='number'
            value={carbs}
            onChange={e => setCarbs(e.target.value)}
            placeholder='0'
            min={0}
            step={0.1}
            className='w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 text-center'
          />
        </div>
        <div>
          <label className='text-[10px] text-rose-600 mb-0.5 block'>
            Lip. (g)
          </label>
          <input
            type='number'
            value={fat}
            onChange={e => setFat(e.target.value)}
            placeholder='0'
            min={0}
            step={0.1}
            className='w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-rose-400 text-center'
          />
        </div>
        <div>
          <label className='text-[10px] text-green-600 mb-0.5 block'>
            Fib. (g)
          </label>
          <input
            type='number'
            value={fiber}
            onChange={e => setFiber(e.target.value)}
            placeholder='—'
            min={0}
            step={0.1}
            className='w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-400 text-center'
          />
        </div>
      </div>

      {error && <p className='text-xs text-red-500'>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors text-sm font-medium disabled:opacity-50'
      >
        {isSubmitting ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='w-4 h-4' />
        )}
        Créer et ajouter
      </button>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function FoodSearchModal({
  mealTypeLabel,
  onAdd,
  onClose,
  addButtonLabel,
  onFoodCreated,
}: FoodSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(
    null
  );
  const [quantity, setQuantity] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState<FoodUnitOption>({
    unit: 'g',
    label: 'grammes',
    gram_equivalent: 1,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const selectedRef = useRef<HTMLDivElement>(null);

  // Fetch available units for the selected food
  const { data: availableUnits, isLoading: unitsLoading } = useFoodUnits(
    selectedFood?.id || null
  );

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
      setHasSearched(false);
      setShowCreateForm(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setShowCreateForm(false);
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
        setHasSearched(true);
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
        selectedRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
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
      calories: Math.round(
        (selectedFood.calories_per_100g * gramEquivalentQty) / 100
      ),
      protein:
        Math.round(
          ((selectedFood.protein_per_100g * gramEquivalentQty) / 100) * 10
        ) / 10,
      carbs:
        Math.round(
          ((selectedFood.carbs_per_100g * gramEquivalentQty) / 100) * 10
        ) / 10,
      fat:
        Math.round(
          ((selectedFood.fat_per_100g * gramEquivalentQty) / 100) * 10
        ) / 10,
      fiber:
        selectedFood.fiber_per_100g != null
          ? Math.round(
              ((selectedFood.fiber_per_100g * gramEquivalentQty) / 100) * 10
            ) / 10
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
    if (unit.unit === 'g') setQuantity(100);
    else if (unit.unit === 'ml') setQuantity(250);
    else setQuantity(1);
  }

  function handleQuantityKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && selectedFood && quantity > 0) {
      e.preventDefault();
      handleAdd();
    }
  }

  // When a custom food is created, select it and add directly with 100g
  function handleCustomFoodCreated(food: FoodSearchResult) {
    setShowCreateForm(false);
    onFoodCreated?.(food.name);
    // Add directly with 100g default
    onAdd({
      food_id: food.id,
      quantity: 100,
      unit: 'g',
      name: food.name,
      calories_per_100g: food.calories_per_100g,
      protein_per_100g: food.protein_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fat_per_100g: food.fat_per_100g,
      gram_equivalent: 1,
    });
  }

  const units: FoodUnitOption[] = availableUnits || [
    { unit: 'g', label: 'grammes', gram_equivalent: 1 },
  ];
  const noResults =
    hasSearched && !loading && results.length === 0 && query.length >= 2;

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
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
                  Rechercher un ingrédient
                </h3>
                <p className='text-xs text-gray-500'>{mealTypeLabel}</p>
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
              onChange={e => {
                setQuery(e.target.value);
                setSelectedFood(null);
                setShowCreateForm(false);
              }}
              placeholder='Rechercher un ingrédient...'
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
              {results.length} résultat{results.length > 1 ? 's' : ''} pour
              &quot;{query}&quot;
            </p>
          )}

          {/* Empty state: no results */}
          {noResults && !showCreateForm && (
            <div className='text-center py-8'>
              <Search className='w-8 h-8 text-gray-200 mx-auto mb-3' />
              <p className='text-sm text-gray-500'>
                Aucun résultat pour &quot;{query}&quot;
              </p>
              <p className='text-xs text-gray-400 mt-1 mb-4'>
                Cet ingrédient n&apos;existe pas encore dans la base
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B]/10 text-[#1B998B] rounded-lg hover:bg-[#1B998B]/20 transition-colors text-sm font-medium'
              >
                <Plus className='w-4 h-4' />
                Créer &quot;{query}&quot;
              </button>
            </div>
          )}

          {/* Prompt before search */}
          {query.length < 2 && !loading && (
            <div className='text-center py-10'>
              <Search className='w-8 h-8 text-gray-200 mx-auto mb-3' />
              <p className='text-sm text-gray-500'>
                Tapez au moins 2 caractères pour rechercher
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Base NutriSensia ({'>'}3000 aliments)
              </p>
            </div>
          )}

          {/* Results list */}
          <div className='space-y-2'>
            {results.map(food => (
              <FoodResultCard
                key={food.id}
                food={food}
                isSelected={selectedFood?.id === food.id}
                onSelect={() => {
                  setSelectedFood(food);
                  setQuantity(100);
                  setShowCreateForm(false);
                }}
              />
            ))}
          </div>

          {/* "Not found" link below results */}
          {results.length > 0 && !selectedFood && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className='mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-[#1B998B] transition-colors'
            >
              <Plus className='w-3.5 h-3.5' />
              Ingrédient introuvable ? Créer un nouvel ingrédient
            </button>
          )}

          {/* Inline create form */}
          {showCreateForm && (
            <div className='mt-3'>
              <CreateFoodForm
                defaultName={query}
                onCreated={handleCustomFoodCreated}
              />
            </div>
          )}

          {/* Selected food configuration panel */}
          {selectedFood && (
            <div
              ref={selectedRef}
              className='mt-3 bg-emerald-50/60 border border-[#1B998B]/20 rounded-xl p-4'
            >
              <div className='flex items-center gap-2 mb-3'>
                <Flame className='w-4 h-4 text-[#1B998B]' />
                <p className='text-sm font-medium text-gray-800 truncate flex-1'>
                  {selectedFood.name}
                </p>
              </div>

              {/* Quantity + Unit row */}
              <div className='flex items-center gap-2 mb-3'>
                <label className='text-xs text-gray-500 shrink-0'>
                  Quantité
                </label>
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
                      <option key={u.unit} value={u.unit}>
                        {u.label}
                      </option>
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
              {addButtonLabel || 'Ajouter au repas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
