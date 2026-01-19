'use client';

import React from 'react';
import { Info } from 'lucide-react';
import type {
  DailyTargets,
  Micronutrient,
  WeekDay,
  DailyPlanTotals,
  MacroStatus,
  NutrientStatus,
} from '@/types/meal-plan';
import { getMacroStatus, getProgressPercentage } from '@/types/meal-plan';

interface DailyObjectivesProps {
  day: WeekDay;
  targets: DailyTargets;
  totals: DailyPlanTotals;
  micronutrients: Micronutrient[];
  showMicronutrients: boolean;
  onToggleMicronutrients: () => void;
}

/**
 * Composant de barre de progression pour les macros
 */
function MacroProgressBar({
  label,
  current,
  target,
  unit,
  colorClass,
  bgColorClass,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  colorClass: string;
  bgColorClass: string;
}) {
  const percentage = getProgressPercentage(current, target);
  const status = getMacroStatus(current, target);

  const getStatusColor = (status: MacroStatus): string => {
    switch (status) {
      case 'good':
        return 'bg-[#1B998B]';
      case 'under':
        return 'bg-amber-500';
      case 'over':
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: MacroStatus): string => {
    switch (status) {
      case 'good':
        return 'Optimal';
      case 'under':
        return 'En dessous';
      case 'over':
        return 'Au dessus';
    }
  };

  return (
    <div className={`${bgColorClass} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            status === 'good'
              ? 'bg-[#1B998B]/20 text-[#1B998B]'
              : status === 'under'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {getStatusText(status)}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-2xl font-bold ${colorClass}`}>{Math.round(current)}</span>
        <span className="text-sm text-gray-500">/ {target} {unit}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getStatusColor(status)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">{percentage}%</p>
    </div>
  );
}

/**
 * Composant de barre de progression pour les micronutriments
 */
function MicronutrientProgressBar({
  nutrient,
}: {
  nutrient: Micronutrient;
}) {
  const percentage = getProgressPercentage(nutrient.value, nutrient.target);

  const getStatusColor = (status: NutrientStatus): string => {
    switch (status) {
      case 'good':
        return 'bg-[#1B998B]';
      case 'warning':
        return 'bg-amber-500';
      case 'low':
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: NutrientStatus): string => {
    switch (status) {
      case 'good':
        return 'Optimal';
      case 'warning':
        return 'À surveiller';
      case 'low':
        return 'Insuffisant';
    }
  };

  const getStatusBadgeStyle = (status: NutrientStatus): string => {
    switch (status) {
      case 'good':
        return 'bg-[#1B998B]/10 text-[#1B998B]';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{nutrient.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeStyle(nutrient.status)}`}>
          {getStatusText(nutrient.status)}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-lg font-bold text-gray-800">{nutrient.value}</span>
        <span className="text-xs text-gray-500">/ {nutrient.target} {nutrient.unit}</span>
      </div>

      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getStatusColor(nutrient.status)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-1 text-right">{percentage}%</p>
    </div>
  );
}

/**
 * Légende explicative des statuts
 */
function StatusLegend() {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg mb-4">
      <div className="flex items-center gap-1.5">
        <Info className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Légende :</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1B998B]" />
        <span className="text-xs text-gray-600">Optimal (90-110%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
        <span className="text-xs text-gray-600">À surveiller (70-90%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="text-xs text-gray-600">Insuffisant (&lt;70%)</span>
      </div>
    </div>
  );
}

export function DailyObjectives({
  day,
  targets,
  totals,
  micronutrients,
  showMicronutrients,
  onToggleMicronutrients,
}: DailyObjectivesProps) {
  // Compter les micronutriments par statut
  const micronutrientStats = {
    good: micronutrients.filter((n) => n.status === 'good').length,
    warning: micronutrients.filter((n) => n.status === 'warning').length,
    low: micronutrients.filter((n) => n.status === 'low').length,
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">
          Plan du {day.full.toLowerCase()} {day.date} janvier
        </h2>
        <button
          onClick={onToggleMicronutrients}
          className="flex items-center gap-2 text-sm text-[#1B998B] font-medium hover:underline"
        >
          {showMicronutrients ? (
            'Masquer micronutriments'
          ) : (
            <>
              Voir micronutriments
              {micronutrientStats.low > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                  {micronutrientStats.low} insuffisant{micronutrientStats.low > 1 ? 's' : ''}
                </span>
              )}
              {micronutrientStats.warning > 0 && micronutrientStats.low === 0 && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                  {micronutrientStats.warning} à surveiller
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Macro progress bars */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <MacroProgressBar
          label="Calories"
          current={totals.calories}
          target={targets.calories}
          unit="kcal"
          colorClass="text-gray-800"
          bgColorClass="bg-gray-50"
        />
        <MacroProgressBar
          label="Protéines"
          current={totals.protein}
          target={targets.protein}
          unit="g"
          colorClass="text-blue-600"
          bgColorClass="bg-blue-50"
        />
        <MacroProgressBar
          label="Glucides"
          current={totals.carbs}
          target={targets.carbs}
          unit="g"
          colorClass="text-amber-600"
          bgColorClass="bg-amber-50"
        />
        <MacroProgressBar
          label="Lipides"
          current={totals.fat}
          target={targets.fat}
          unit="g"
          colorClass="text-rose-600"
          bgColorClass="bg-rose-50"
        />
      </div>

      {/* Légende toujours visible */}
      <StatusLegend />

      {/* Micronutrients detail */}
      {showMicronutrients && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Micronutriments</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1B998B]" />
                <span className="text-gray-500">{micronutrientStats.good} optimal</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-500">{micronutrientStats.warning} à surveiller</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-500">{micronutrientStats.low} insuffisant</span>
              </span>
            </div>
          </div>

          {/* Grille des micronutriments */}
          <div className="grid grid-cols-3 gap-3">
            {micronutrients.map((nutrient) => (
              <MicronutrientProgressBar key={nutrient.id} nutrient={nutrient} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyObjectives;
