'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  DailyTargets,
  Micronutrient,
  WeekDay,
  DailyPlanTotals,
  NutrientStatus,
} from '@/types/meal-plan';

interface DailyObjectivesDropdownProps {
  day: WeekDay;
  targets: DailyTargets;
  totals: DailyPlanTotals;
  micronutrients: Micronutrient[];
}

// Same color scheme as MacroBadgesGrid
const MACRO_ITEMS = [
  { key: 'calories' as const, label: 'Énergie', unit: 'kcal', bgColor: 'bg-orange-50', textColor: 'text-orange-700', labelColor: 'text-orange-600', barColor: 'bg-orange-400' },
  { key: 'protein' as const, label: 'Protéines', unit: 'g', bgColor: 'bg-blue-50', textColor: 'text-blue-700', labelColor: 'text-blue-600', barColor: 'bg-blue-400' },
  { key: 'carbs' as const, label: 'Glucides', unit: 'g', bgColor: 'bg-amber-50', textColor: 'text-amber-700', labelColor: 'text-amber-600', barColor: 'bg-amber-400' },
  { key: 'fat' as const, label: 'Lipides', unit: 'g', bgColor: 'bg-rose-50', textColor: 'text-rose-700', labelColor: 'text-rose-600', barColor: 'bg-rose-400' },
  { key: 'fiber' as const, label: 'Fibres', unit: 'g', bgColor: 'bg-green-50', textColor: 'text-green-700', labelColor: 'text-green-600', barColor: 'bg-green-500' },
] as const;

const TOTALS_MAP = {
  calories: 'calories',
  protein: 'protein',
  carbs: 'carbs',
  fat: 'fat',
  fiber: 'fiber',
} as const;

const TARGETS_MAP = {
  calories: 'calories',
  protein: 'protein',
  carbs: 'carbs',
  fat: 'fat',
  fiber: 'fiber',
} as const;

// Catégories de micronutriments (même organisation que le dashboard nutritionniste)
const MICRONUTRIENT_CATEGORIES = [
  {
    label: 'Vitamines',
    icon: '💊',
    keys: [
      'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
      'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b6',
      'vitamin_b9', 'vitamin_b12',
    ],
  },
  {
    label: 'Minéraux',
    icon: '⛏️',
    keys: ['calcium', 'iron', 'magnesium', 'phosphorus', 'zinc', 'potassium', 'sodium'],
  },
] as const;

function getStatusColor(status: NutrientStatus): string {
  switch (status) {
    case 'good': return 'text-[#1B998B]';
    case 'warning': return 'text-amber-600';
    case 'low': return 'text-red-500';
  }
}

function MicronutrientItem({ nutrient }: { nutrient: Micronutrient }) {
  return (
    <div className='p-2.5 bg-gray-50 rounded-lg'>
      <p className='text-xs font-medium text-gray-700 mb-0.5'>{nutrient.name}</p>
      <div className='flex items-baseline gap-0.5'>
        <span className={`text-sm font-bold ${getStatusColor(nutrient.status)}`}>{nutrient.value}</span>
        <span className='text-[10px] text-gray-500'>/ {nutrient.target} {nutrient.unit}</span>
      </div>
    </div>
  );
}

export function DailyObjectivesDropdown({
  day,
  targets,
  totals,
  micronutrients,
}: DailyObjectivesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const monthName = day.dateObj.toLocaleDateString('fr-FR', { month: 'long' });

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full p-4 hover:bg-gray-50 transition-colors text-left'
      >
        <div className='flex items-center justify-between mb-3'>
          <h2 className='font-semibold text-gray-800'>
            Objectifs du {day.full.toLowerCase()} {day.date} {monthName}
          </h2>
          <div className='flex items-center gap-2'>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Compact macro summary — 5 badges (same as MacroBadgesGrid) */}
        <div className='grid grid-cols-5 gap-2'>
          {MACRO_ITEMS.map(cfg => {
            const current = totals[TOTALS_MAP[cfg.key]];
            const target = targets[TARGETS_MAP[cfg.key]];
            const display = cfg.key === 'calories' ? Math.round(current) : Math.round(current * 10) / 10;

            return (
              <div key={cfg.key} className={`${cfg.bgColor} rounded-lg px-3 py-3 text-center`}>
                <span className={`text-xs font-medium ${cfg.labelColor} leading-none mb-1 block`}>
                  {cfg.label}
                </span>
                <p className={`text-base font-bold ${cfg.textColor} leading-tight`}>
                  {display}
                  <span className='text-xs font-normal ml-0.5'>/ {target} {cfg.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      </button>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='border-t border-gray-100 p-4'>
              {/* Micronutriments par catégorie */}
              <div className='space-y-5'>
                {MICRONUTRIENT_CATEGORIES.map(category => {
                  const categoryNutrients = micronutrients.filter(n =>
                    category.keys.some(k => n.id.includes(k))
                  );
                  if (categoryNutrients.length === 0) return null;

                  return (
                    <div key={category.label}>
                      <h4 className='text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5'>
                        <span>{category.icon}</span>
                        {category.label}
                      </h4>
                      <div className='grid grid-cols-5 gap-2'>
                        {categoryNutrients.map(nutrient => (
                          <MicronutrientItem key={nutrient.id} nutrient={nutrient} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Autres micronutriments non catégorisés */}
                {(() => {
                  const allKeys = MICRONUTRIENT_CATEGORIES.flatMap(c => c.keys);
                  const uncategorized = micronutrients.filter(
                    n => !allKeys.some(k => n.id.includes(k))
                  );
                  if (uncategorized.length === 0) return null;
                  return (
                    <div>
                      <h4 className='text-sm font-medium text-gray-600 mb-2'>Autres</h4>
                      <div className='grid grid-cols-5 gap-2'>
                        {uncategorized.map(nutrient => (
                          <MicronutrientItem key={nutrient.id} nutrient={nutrient} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DailyObjectivesDropdown;
