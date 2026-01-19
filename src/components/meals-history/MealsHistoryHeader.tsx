'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { ViewToggle } from './ViewToggle';
import type { ViewMode } from '@/types/meals-history';

interface MealsHistoryHeaderProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddMeal: () => void;
  onGoToToday: () => void;
  showTodayButton?: boolean;
}

export function MealsHistoryHeader({
  activeView,
  onViewChange,
  onAddMeal,
  onGoToToday,
  showTodayButton = true,
}: MealsHistoryHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div>
        {/* Title and Add button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Mes repas</h1>
            <p className="text-sm text-gray-500">
              Suivez et enregistrez votre alimentation
            </p>
          </div>
          <button
            onClick={onAddMeal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Ajouter un repas
          </button>
        </div>

        {/* View toggle and date navigation */}
        <div className="flex items-center justify-between">
          <ViewToggle activeView={activeView} onViewChange={onViewChange} />

          {showTodayButton && activeView !== 'list' && (
            <button
              onClick={onGoToToday}
              className="px-3 py-1.5 text-sm text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors"
            >
              Aujourd&apos;hui
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MealsHistoryHeader;
