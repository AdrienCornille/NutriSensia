/**
 * Transformations pour le module Poids
 * Conversion entre types API et types UI
 */

import { startOfWeek, addDays, format, subMonths, subYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { WeightData, WeightEntry, WeightTrend } from '@/types/suivi';

// ============================================================================
// TYPES API
// ============================================================================

export interface WeightEntryAPI {
  id: string;
  user_id: string;
  weight_kg: number;
  date: string; // 'YYYY-MM-DD'
  variation_kg: number; // Calculé par l'API
  notes?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightGoalAPI {
  id: string;
  user_id: string;
  initial_weight_kg: number;
  target_weight_kg: number;
  target_date?: string; // 'YYYY-MM-DD'
  is_achieved: boolean;
  achieved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightEntriesResponse {
  entries: WeightEntryAPI[];
  statistics: {
    current_weight: number | null;
    goal_weight: number | null;
    initial_weight: number | null;
    total_change: number;
    entries_count: number;
  };
  goal: WeightGoalAPI | null;
}

// ============================================================================
// HELPERS DE DATE
// ============================================================================

/**
 * Convertit une date en string YYYY-MM-DD (timezone local)
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Filtre les entrées par plage de temps
 */
export function filterEntriesByTimeRange(
  entries: WeightEntryAPI[],
  timeRange: '1S' | '1M' | '3M' | '6M' | '1A' | 'Tout'
): WeightEntryAPI[] {
  if (timeRange === 'Tout') return entries;

  const now = new Date();
  let cutoffDate: Date;

  switch (timeRange) {
    case '1S':
      cutoffDate = startOfWeek(now, { weekStartsOn: 1 });
      break;
    case '1M':
      cutoffDate = subMonths(now, 1);
      break;
    case '3M':
      cutoffDate = subMonths(now, 3);
      break;
    case '6M':
      cutoffDate = subMonths(now, 6);
      break;
    case '1A':
      cutoffDate = subYears(now, 1);
      break;
    default:
      return entries;
  }

  return entries.filter(entry => new Date(entry.date) >= cutoffDate);
}

// ============================================================================
// TRANSFORMATIONS PRINCIPALES
// ============================================================================

/**
 * Détermine la tendance du poids
 */
export function calculateWeightTrend(
  current: number,
  previous: number,
  threshold: number = 0.1
): WeightTrend {
  const diff = current - previous;
  if (Math.abs(diff) < threshold) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

/**
 * Calcule la variation hebdomadaire moyenne
 */
export function calculateWeeklyChange(entries: WeightEntryAPI[]): number {
  if (entries.length < 2) return 0;

  // Trier par date croissante
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];

  const firstDate = new Date(firstEntry.date);
  const lastDate = new Date(lastEntry.date);

  const daysDiff = Math.max(
    1,
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeksDiff = daysDiff / 7;

  const totalChange = lastEntry.weight_kg - firstEntry.weight_kg;
  const weeklyChange = totalChange / weeksDiff;

  return Math.round(weeklyChange * 100) / 100; // 2 décimales
}

/**
 * Transforme les entrées API en historique UI
 */
export function transformWeightEntries(
  entries: WeightEntryAPI[]
): WeightEntry[] {
  return entries.map(entry => ({
    id: entry.id,
    date: new Date(entry.date),
    value: entry.weight_kg,
  }));
}

/**
 * Transforme la réponse API complète en données UI
 */
export function transformWeightData(
  response: WeightEntriesResponse,
  timeRange: '1S' | '1M' | '3M' | '6M' | '1A' | 'Tout' = '1M'
): WeightData {
  const { entries, statistics, goal } = response;

  // Filtrer les entrées selon la plage de temps
  const filteredEntries = filterEntriesByTimeRange(entries, timeRange);

  // Convertir en format UI
  const history = transformWeightEntries(filteredEntries);

  // Valeurs par défaut si pas de données
  if (entries.length === 0) {
    return {
      current: 0,
      initial: 0,
      goal: goal?.goal_weight_kg || 0,
      change: 0,
      changePercent: 0,
      trend: 'stable',
      weeklyChange: 0,
      history: [],
    };
  }

  // Calculs
  const current = statistics.current_weight || 0;
  const initial = statistics.initial_weight || current;
  const goalWeight = goal?.target_weight_kg || current;

  const change = Number((current - initial).toFixed(2));
  const changePercent =
    initial !== 0 ? Math.round((change / initial) * 10000) / 100 : 0; // 2 décimales

  // Déterminer la tendance sur la dernière semaine
  const lastWeekEntries = filterEntriesByTimeRange(entries, '1S');
  const trend =
    lastWeekEntries.length >= 2
      ? calculateWeightTrend(
          lastWeekEntries[0].weight_kg,
          lastWeekEntries[lastWeekEntries.length - 1].weight_kg
        )
      : 'stable';

  const weeklyChange = calculateWeeklyChange(filteredEntries);

  return {
    current,
    initial,
    goal: goalWeight,
    change,
    changePercent,
    trend,
    weeklyChange,
    history,
  };
}

/**
 * Calcule le pourcentage de progression vers l'objectif
 */
export function calculateWeightProgress(
  initial: number,
  current: number,
  goal: number
): number {
  if (initial === goal) return 100;

  const totalChange = Math.abs(initial - goal);
  const actualChange = Math.abs(initial - current);

  // Si on va dans la bonne direction
  const isGoingTowardGoal =
    (goal < initial && current <= initial) ||
    (goal > initial && current >= initial);

  if (!isGoingTowardGoal) return 0;

  const progress = (actualChange / totalChange) * 100;
  return Math.min(Math.max(Math.round(progress), 0), 100);
}

/**
 * Formate le poids pour l'affichage
 */
export function formatWeight(weightKg: number, decimals: number = 1): string {
  return weightKg.toFixed(decimals);
}

/**
 * Formate la variation de poids
 */
export function formatWeightChange(
  changeKg: number,
  decimals: number = 1
): string {
  const sign = changeKg >= 0 ? '+' : '';
  return `${sign}${changeKg.toFixed(decimals)} kg`;
}

/**
 * Calcule l'IMC (Indice de Masse Corporelle)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm === 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // 1 décimale
}

/**
 * Catégorise l'IMC selon l'OMS
 */
export function categorizeBMI(bmi: number): {
  category: string;
  color: string;
} {
  if (bmi < 18.5) {
    return { category: 'Insuffisance pondérale', color: 'text-blue-600' };
  } else if (bmi < 25) {
    return { category: 'Poids normal', color: 'text-green-600' };
  } else if (bmi < 30) {
    return { category: 'Surpoids', color: 'text-amber-600' };
  } else if (bmi < 35) {
    return { category: 'Obésité modérée', color: 'text-orange-600' };
  } else if (bmi < 40) {
    return { category: 'Obésité sévère', color: 'text-red-600' };
  } else {
    return { category: 'Obésité morbide', color: 'text-red-700' };
  }
}

/**
 * Estime le temps pour atteindre l'objectif
 */
export function estimateTimeToGoal(
  current: number,
  goal: number,
  weeklyChange: number
): { weeks: number; formattedDate: string } | null {
  if (weeklyChange === 0) return null;

  const totalChangeNeeded = Math.abs(goal - current);
  const weeks = Math.ceil(totalChangeNeeded / Math.abs(weeklyChange));

  const targetDate = addDays(new Date(), weeks * 7);
  const formattedDate = format(targetDate, 'dd MMMM yyyy', { locale: fr });

  return { weeks, formattedDate };
}
