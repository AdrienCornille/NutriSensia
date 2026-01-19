'use client';

import React from 'react';
import { BarChart2, Calendar, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DailySummaryData, PlanComparisonData, PlanStatus } from '@/types/meals-history';

interface DailySidebarProps {
  summaryData: DailySummaryData;
  planComparison: PlanComparisonData;
  onViewPlan?: () => void;
  onViewStats?: () => void;
}

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

function MacroBar({ label, current, target, unit, color }: MacroBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(current)} / {target}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StatusConfig {
  bgColor: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

function getStatusConfig(status: PlanStatus): StatusConfig {
  switch (status) {
    case 'excellent':
      return {
        bgColor: 'bg-[#1B998B]',
        bgLight: 'bg-[#1B998B]/10',
        textColor: 'text-[#1B998B]',
        borderColor: 'border-[#1B998B]/20',
        icon: <CheckCircle2 className="w-5 h-5 text-[#1B998B]" />,
      };
    case 'good':
      return {
        bgColor: 'bg-[#1B998B]',
        bgLight: 'bg-[#1B998B]/10',
        textColor: 'text-[#1B998B]',
        borderColor: 'border-[#1B998B]/20',
        icon: <CheckCircle2 className="w-5 h-5 text-[#1B998B]" />,
      };
    case 'warning':
      return {
        bgColor: 'bg-amber-500',
        bgLight: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200',
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      };
    case 'poor':
      return {
        bgColor: 'bg-red-500',
        bgLight: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      };
    default:
      return {
        bgColor: 'bg-gray-500',
        bgLight: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200',
        icon: <Minus className="w-5 h-5 text-gray-500" />,
      };
  }
}

function DeviationIndicator({ deviation }: { deviation: number }) {
  if (Math.abs(deviation) <= 10) {
    return <Minus className="w-4 h-4 text-gray-400" />;
  }
  if (deviation > 0) {
    return <TrendingUp className="w-4 h-4 text-amber-500" />;
  }
  return <TrendingDown className="w-4 h-4 text-amber-500" />;
}

export function DailySidebar({
  summaryData,
  planComparison,
  onViewPlan,
  onViewStats,
}: DailySidebarProps) {
  const caloriesPercentage = Math.min(
    (summaryData.calories.consumed / summaryData.calories.target) * 100,
    100
  );
  const statusConfig = getStatusConfig(planComparison.status);

  return (
    <aside className="w-96 flex-shrink-0 hidden lg:block">
      <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-32">
        <h3 className="font-semibold text-gray-800 mb-4">Résumé du jour</h3>

        {/* Calories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Calories</span>
            <span className="font-semibold text-gray-800">
              {summaryData.calories.consumed} / {summaryData.calories.target}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1B998B] rounded-full transition-all duration-500"
              style={{ width: `${caloriesPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reste {summaryData.calories.remaining} kcal
          </p>
        </div>

        {/* Macros */}
        <div className="space-y-4">
          <MacroBar
            label="Protéines"
            current={summaryData.macros.protein.current}
            target={summaryData.macros.protein.target}
            unit="g"
            color="bg-blue-500"
          />
          <MacroBar
            label="Glucides"
            current={summaryData.macros.carbs.current}
            target={summaryData.macros.carbs.target}
            unit="g"
            color="bg-amber-500"
          />
          <MacroBar
            label="Lipides"
            current={summaryData.macros.fat.current}
            target={summaryData.macros.fat.target}
            unit="g"
            color="bg-rose-500"
          />
        </div>

        {/* Plan comparison */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            vs Plan alimentaire
          </h4>
          <div
            className={`p-4 rounded-xl border ${statusConfig.bgLight} ${statusConfig.borderColor}`}
          >
            {/* Status header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${statusConfig.bgLight} border ${statusConfig.borderColor}`}
              >
                <span className={`${statusConfig.textColor} font-bold text-lg`}>
                  {planComparison.adherencePercentage}%
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {statusConfig.icon}
                  <p className={`font-medium ${statusConfig.textColor}`}>
                    {planComparison.statusLabel}
                  </p>
                </div>
                <p className={`text-sm ${statusConfig.textColor} opacity-80`}>
                  {planComparison.message}
                </p>
              </div>
            </div>

            {/* Macro deviations summary */}
            {planComparison.deviations && planComparison.deviations.length > 0 && (
              <div className="pt-3 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 mb-2">Détail par macro</p>
                <div className="grid grid-cols-3 gap-2">
                  {planComparison.deviations
                    .filter((d) => d.macro !== 'calories')
                    .map((deviation) => (
                      <div
                        key={deviation.macro}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-white/60 rounded-lg"
                      >
                        <DeviationIndicator deviation={deviation.deviation} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {deviation.label}
                          </p>
                          <p className={`text-xs ${
                            deviation.status === 'ok'
                              ? 'text-gray-500'
                              : deviation.status === 'slight'
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}>
                            {deviation.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
          <button
            onClick={onViewPlan}
            className="w-full py-2.5 text-center text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Voir mon plan du jour
          </button>
          <button
            onClick={onViewStats}
            className="w-full py-2.5 text-center text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            Statistiques détaillées
          </button>
        </div>
      </div>
    </aside>
  );
}

export default DailySidebar;
