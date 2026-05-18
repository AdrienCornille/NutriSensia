'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Info,
  X,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RecipeIngredientItem } from '@/lib/api-schemas';
import {
  FoodSearchModal,
  FoodAddPayload,
} from '@/components/nutritionist/meal-plans/FoodSearchModal';

// ==================== UNIT CONSTANTS ====================

const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  ml: 'ml',
  c_a_s: 'c. à soupe',
  c_a_c: 'c. à café',
  tasse: 'tasse',
  portion: 'portion',
  piece: 'pièce',
};

const DEFAULT_UNITS = [
  'g',
  'ml',
  'c_a_s',
  'c_a_c',
  'tasse',
  'portion',
  'piece',
];

const UNIT_DROPDOWN_OPTIONS = DEFAULT_UNITS.map(u => ({
  value: u,
  label: UNIT_LABELS[u] || u,
}));

// Compact inline dropdown matching input height (py-1.5) for ingredient rows
function UnitDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white border rounded-md text-xs transition-colors ${
          open
            ? 'border-[#1B998B] ring-1 ring-[#1B998B]/20'
            : 'border-gray-200 hover:border-gray-300'
        } text-gray-700`}
      >
        <span className='truncate'>{UNIT_LABELS[value] || value}</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className='absolute z-50 mt-1 w-full min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-auto'>
          {UNIT_DROPDOWN_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type='button'
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors ${
                value === opt.value
                  ? 'bg-[#1B998B]/5 text-[#1B998B] font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && (
                <svg
                  className='w-3 h-3 text-[#1B998B] shrink-0'
                  viewBox='0 0 12 12'
                  fill='none'
                >
                  <path
                    d='M2 6l3 3 5-5'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Default gram equivalents for units (used when food-specific data isn't available)
const DEFAULT_GRAM_EQUIVALENTS: Record<string, number> = {
  g: 1,
  ml: 1,
  c_a_s: 15,
  c_a_c: 5,
  tasse: 250,
  portion: 100,
  piece: 100,
};

// ==================== TYPES ====================

interface IngredientFormItem extends Omit<
  RecipeIngredientItem,
  'display_order'
> {
  _tempId: string;
  quantity_number?: number; // The user-facing number (e.g., 2 for "2 c. à soupe")
  // Nutrition per 100g (from CIQUAL, stored client-side for real-time calculation)
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number | null;
}

interface RecipeIngredientEditorProps {
  ingredients: IngredientFormItem[];
  onChange: (ingredients: IngredientFormItem[]) => void;
  onFoodCreated?: (name: string) => void;
}

function createEmptyIngredient(): IngredientFormItem {
  return {
    _tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: '',
    quantity: '',
    quantity_number: undefined,
    quantity_value: null,
    quantity_unit: 'g',
    food_id: null,
    is_optional: false,
    substitution_notes: null,
    group_name: null,
  };
}

// ==================== INFO MODAL ====================

function IngredientFieldsInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='fixed inset-0 bg-black/40' onClick={onClose} />
      <div className='relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
            <Info className='w-4 h-4 text-[#1B998B]' />
            Guide des champs ingrédient
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto px-6 py-4 space-y-4'>
          <div className='space-y-1.5'>
            <h4 className='text-sm font-medium text-gray-800'>
              Nom et quantité
            </h4>
            <p className='text-xs text-gray-500 leading-relaxed'>
              Le nom de l&apos;ingrédient tel qu&apos;il apparaitra dans la
              recette. Saisissez la quantité et choisissez l&apos;unité dans le
              menu déroulant. La valeur en grammes est calculée automatiquement.
            </p>
          </div>

          <div className='border-b border-gray-100' />

          <div className='space-y-1.5'>
            <h4 className='text-sm font-medium text-gray-800'>
              Base d&apos;ingrédients
            </h4>
            <p className='text-xs text-gray-500 leading-relaxed'>
              Recherchez un ingrédient dans la base NutriSensia (base CIQUAL +
              ingrédients personnalisés). Les valeurs nutritionnelles sont
              calculées automatiquement (calories, protéines, glucides, lipides,
              fibres).
            </p>
            <p className='text-xs text-gray-500 leading-relaxed'>
              Si un ingrédient n&apos;existe pas dans la base, vous pouvez le
              créer directement depuis la recherche en renseignant ses valeurs
              nutritionnelles pour 100g. Il sera ensuite disponible pour toutes
              vos recettes et plans alimentaires.
            </p>
          </div>

          <div className='border-b border-gray-100' />

          <div className='space-y-1.5'>
            <h4 className='text-sm font-medium text-gray-800'>Facultatif</h4>
            <p className='text-xs text-gray-500 leading-relaxed'>
              Cochez cette case pour les ingrédients qui ne sont pas
              indispensables à la recette. Exemples : herbes de décoration,
              piment pour relever, topping optionnel.
            </p>
            <p className='text-xs text-gray-500 leading-relaxed'>
              Les ingrédients facultatifs sont affichés en italique avec la
              mention &quot;(optionnel)&quot; dans le détail de la recette côté
              patient.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-3 border-t border-gray-100'>
          <button
            type='button'
            onClick={onClose}
            className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== SORTABLE ROW ====================

function SortableIngredientRow({
  ing,
  globalIdx,
  onFieldChange,
  onBatchChange,
  onRemove,
}: {
  ing: IngredientFormItem;
  globalIdx: number;
  onFieldChange: (
    index: number,
    field: keyof IngredientFormItem,
    value: unknown
  ) => void;
  onBatchChange: (index: number, updates: Partial<IngredientFormItem>) => void;
  onRemove: (index: number) => void;
}) {
  const sortableId = ing._tempId || ing.id || `idx-${globalIdx}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleQuantityChange = useCallback(
    (num: number) => {
      const unit = ing.quantity_unit || 'g';
      const gramEq = DEFAULT_GRAM_EQUIVALENTS[unit] || 1;
      onBatchChange(globalIdx, {
        quantity_number: num,
        quantity: `${num} ${UNIT_LABELS[unit] || unit}`,
        quantity_value: num * gramEq,
      });
    },
    [ing.quantity_unit, globalIdx, onBatchChange]
  );

  const handleUnitChange = useCallback(
    (unit: string) => {
      const num = ing.quantity_number || 0;
      const gramEq = DEFAULT_GRAM_EQUIVALENTS[unit] || 1;
      onBatchChange(globalIdx, {
        quantity_unit: unit,
        quantity: `${num} ${UNIT_LABELS[unit] || unit}`,
        quantity_value: num * gramEq,
      });
    },
    [ing.quantity_number, globalIdx, onBatchChange]
  );

  const gramHint =
    ing.quantity_unit &&
    ing.quantity_unit !== 'g' &&
    ing.quantity_unit !== 'ml' &&
    ing.quantity_value
      ? `= ${Math.round(ing.quantity_value)}g`
      : null;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        gridTemplateColumns: '20px 1fr auto 64px 96px auto auto 28px',
      }}
      className='grid items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100 group'
    >
      {/* 1. Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className='cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none flex justify-center'
      >
        <GripVertical className='w-3.5 h-3.5' />
      </div>

      {/* 2. Name */}
      <input
        type='text'
        value={ing.name}
        onChange={e => onFieldChange(globalIdx, 'name', e.target.value)}
        placeholder="Nom de l'ingrédient"
        className='min-w-0 px-2.5 py-1.5 text-xs text-gray-700 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1B998B]'
      />

      {/* 3. CIQUAL badge */}
      {ing.food_id ? (
        <span
          className='px-1.5 py-0.5 text-[10px] font-medium bg-[#1B998B]/10 text-[#1B998B] rounded-full whitespace-nowrap'
          title='Lié à la base CIQUAL'
        >
          CIQUAL
        </span>
      ) : (
        <span
          className='px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-400 rounded-full whitespace-nowrap'
          title='Non lié à la base CIQUAL'
        >
          Manuel
        </span>
      )}

      {/* 4. Quantity number */}
      <input
        type='number'
        value={ing.quantity_number ?? ''}
        onChange={e => handleQuantityChange(parseFloat(e.target.value) || 0)}
        placeholder='Qté'
        min={0}
        step={0.1}
        className='px-2 py-1.5 text-xs text-gray-700 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1B998B] text-center'
      />

      {/* 5. Unit dropdown — compact inline version matching input height */}
      <UnitDropdown
        value={ing.quantity_unit || 'g'}
        onChange={handleUnitChange}
      />

      {/* 6. Gram equivalent hint */}
      <span className='text-[10px] text-gray-400 whitespace-nowrap min-w-[40px]'>
        {gramHint || ''}
      </span>

      {/* 7. Optional toggle — NutriSensia design */}
      <button
        type='button'
        onClick={() =>
          onFieldChange(globalIdx, 'is_optional', !ing.is_optional)
        }
        className='flex items-center gap-1.5 whitespace-nowrap'
        title='Ingrédient facultatif'
      >
        <span
          className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors ${
            ing.is_optional
              ? 'bg-[#1B998B] border-[#1B998B]'
              : 'border-gray-300 bg-white'
          }`}
        >
          {ing.is_optional && (
            <svg
              className='w-2.5 h-2.5 text-white'
              viewBox='0 0 12 12'
              fill='none'
            >
              <path
                d='M2 6l3 3 5-5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}
        </span>
        <span className='text-[10px] text-gray-500'>Opt.</span>
      </button>

      {/* 8. Delete */}
      <button
        type='button'
        onClick={() => onRemove(globalIdx)}
        className='p-1 text-gray-400 hover:text-red-500 transition-colors flex justify-center'
      >
        <Trash2 className='w-4 h-4' />
      </button>
    </div>
  );
}

// ==================== COMPONENT ====================

export function RecipeIngredientEditor({
  ingredients,
  onChange,
  onFoodCreated,
}: RecipeIngredientEditorProps) {
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [showInfoModal, setShowInfoModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortableIds = useMemo(
    () => ingredients.map((ing, idx) => ing._tempId || ing.id || `idx-${idx}`),
    [ingredients]
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(ingredients.filter((_, i) => i !== index));
    },
    [ingredients, onChange]
  );

  const handleChange = useCallback(
    (index: number, field: keyof IngredientFormItem, value: unknown) => {
      const updated = ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      );
      onChange(updated);
    },
    [ingredients, onChange]
  );

  const handleBatchChange = useCallback(
    (index: number, updates: Partial<IngredientFormItem>) => {
      const updated = ingredients.map((ing, i) =>
        i === index ? { ...ing, ...updates } : ing
      );
      onChange(updated);
    },
    [ingredients, onChange]
  );

  const handleFoodSelect = useCallback(
    (payload: FoodAddPayload) => {
      const nutritionData = {
        calories_per_100g: payload.calories_per_100g,
        protein_per_100g: payload.protein_per_100g,
        carbs_per_100g: payload.carbs_per_100g,
        fat_per_100g: payload.fat_per_100g,
      };

      const unit = payload.unit;
      const gramEq = DEFAULT_GRAM_EQUIVALENTS[unit] || payload.gram_equivalent;

      if (editingIndex !== null && editingIndex < ingredients.length) {
        const updated = [...ingredients];
        updated[editingIndex] = {
          ...updated[editingIndex],
          food_id: payload.food_id,
          name: payload.name,
          quantity_number: payload.quantity,
          quantity: `${payload.quantity} ${UNIT_LABELS[unit] || unit}`,
          quantity_value: payload.quantity * gramEq,
          quantity_unit: unit,
          ...nutritionData,
        };
        onChange(updated);
      } else {
        const newIng: IngredientFormItem = {
          _tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          food_id: payload.food_id,
          name: payload.name,
          quantity_number: payload.quantity,
          quantity: `${payload.quantity} ${UNIT_LABELS[unit] || unit}`,
          quantity_value: payload.quantity * gramEq,
          quantity_unit: unit,
          is_optional: false,
          substitution_notes: null,
          group_name: null,
          ...nutritionData,
        };
        onChange([...ingredients, newIng]);
      }
      setShowFoodSearch(false);
      setEditingIndex(null);
    },
    [editingIndex, ingredients, onChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = ingredients.findIndex(
          (ing, idx) => (ing._tempId || ing.id || `idx-${idx}`) === active.id
        );
        const newIndex = ingredients.findIndex(
          (ing, idx) => (ing._tempId || ing.id || `idx-${idx}`) === over.id
        );
        if (oldIndex !== -1 && newIndex !== -1) {
          onChange(arrayMove(ingredients, oldIndex, newIndex));
        }
      }
    },
    [ingredients, onChange]
  );

  // Group ingredients
  const groups = ingredients.reduce<
    Record<string, { items: IngredientFormItem[]; indices: number[] }>
  >((acc, ing, idx) => {
    const group = ing.group_name || '';
    if (!acc[group]) acc[group] = { items: [], indices: [] };
    acc[group].items.push(ing);
    acc[group].indices.push(idx);
    return acc;
  }, {});

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-gray-700'>Ingrédients</h3>
          <button
            type='button'
            onClick={() => setShowInfoModal(true)}
            className='p-1 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/5 rounded-full transition-colors'
            title='Aide sur les champs'
          >
            <Info className='w-4 h-4' />
          </button>
        </div>
        <button
          type='button'
          onClick={() => {
            setEditingIndex(null);
            setShowFoodSearch(true);
          }}
          className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B998B] bg-[#1B998B]/10 rounded-lg hover:bg-[#1B998B]/20 transition-colors'
        >
          <Plus className='w-3.5 h-3.5' />
          Ajouter un ingrédient
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div className='text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl'>
          Aucun ingrédient. Cliquez sur &quot;Ajouter un ingrédient&quot; pour
          commencer.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-2'>
              {Object.entries(groups).map(([groupName, { items, indices }]) => (
                <div key={groupName || '__default'} className='space-y-2'>
                  {groupName && (
                    <button
                      type='button'
                      onClick={() =>
                        setExpandedGroups(prev => ({
                          ...prev,
                          [groupName]: !prev[groupName],
                        }))
                      }
                      className='flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide'
                    >
                      {expandedGroups[groupName] === false ? (
                        <ChevronDown className='w-3.5 h-3.5' />
                      ) : (
                        <ChevronUp className='w-3.5 h-3.5' />
                      )}
                      {groupName}
                    </button>
                  )}
                  {(expandedGroups[groupName] !== false || !groupName) &&
                    items.map((ing, localIdx) => {
                      const globalIdx = indices[localIdx];
                      return (
                        <SortableIngredientRow
                          key={ing._tempId || ing.id || globalIdx}
                          ing={ing}
                          globalIdx={globalIdx}
                          onFieldChange={handleChange}
                          onBatchChange={handleBatchChange}
                          onRemove={handleRemove}
                        />
                      );
                    })}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <IngredientFieldsInfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {/* Food Search Modal */}
      {showFoodSearch && (
        <FoodSearchModal
          mealTypeLabel='Ingrédient de recette'
          addButtonLabel='Ajouter à la recette'
          onAdd={handleFoodSelect}
          onFoodCreated={onFoodCreated}
          onClose={() => {
            setShowFoodSearch(false);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
}

export type { IngredientFormItem };
