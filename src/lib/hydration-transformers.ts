/**
 * Transformations pour le module Hydratation
 * Conversion entre types API et types UI
 */

import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { HydrationData, HydrationDayEntry } from '@/types/suivi';

// ============================================================================
// TYPES API
// ============================================================================

export interface HydrationLog {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  amount_ml: number;
  beverage_type: 'water' | 'tea' | 'coffee' | 'juice' | 'other';
  notes?: string;
  created_at: string; // ISO datetime
  updated_at: string;
}

export interface HydrationGoal {
  id: string | null;
  user_id: string;
  daily_goal_ml: number;
  valid_from: string; // 'YYYY-MM-DD'
  valid_until?: string | null;
  created_at: string;
  updated_at: string;
  is_default?: boolean; // Flag pour objectif par défaut (non en DB)
}

export interface HydrationLogsResponse {
  logs: HydrationLog[];
  summary: {
    total_ml: number;
    goal_ml: number;
    percentage: number;
  };
}

// ============================================================================
// HELPERS DE DATE
// ============================================================================

/**
 * Génère un tableau de 7 dates représentant une semaine
 * La semaine commence le lundi
 *
 * @param centerDate - Date de référence (optionnel, défaut = aujourd'hui)
 * @returns Tableau de 7 dates (lundi à dimanche)
 */
export function getWeekDates(centerDate: Date = new Date()): Date[] {
  const start = startOfWeek(centerDate, { weekStartsOn: 1 }); // 1 = Lundi
  const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return dates;
}

/**
 * Formate une date en label de jour court (Lun, Mar, etc.)
 *
 * @param date - Date à formater
 * @returns Label du jour ('Lun', 'Mar', 'Mer', etc.)
 */
export function formatDayLabel(date: Date): string {
  return format(date, 'EEE', { locale: fr });
}

/**
 * Convertit une date en string YYYY-MM-DD (timezone local)
 *
 * @param date - Date à formater
 * @returns String au format 'YYYY-MM-DD'
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// TRANSFORMATIONS PRINCIPALES
// ============================================================================

/**
 * Transforme les logs d'aujourd'hui en total (litres)
 * Utilisé pour afficher la consommation actuelle
 *
 * @param logs - Logs d'hydratation
 * @returns Total consommé en litres
 */
export function transformTodayLogs(logs: HydrationLog[]): number {
  if (!logs || logs.length === 0) return 0;

  const totalMl = logs.reduce((sum, log) => sum + log.amount_ml, 0);
  return Math.round((totalMl / 1000) * 100) / 100; // Conversion ml → L avec 2 décimales
}

/**
 * Transforme les logs API en données UI pour l'historique hebdomadaire
 * Génère un historique de 7 jours avec statistiques
 *
 * @param logs - Logs d'hydratation (peuvent couvrir plusieurs jours)
 * @param goal - Objectif d'hydratation actuel
 * @param centerDate - Date centrale pour la semaine (défaut = aujourd'hui)
 * @returns Données formatées pour l'UI
 */
export function transformLogsToHydrationData(
  logs: HydrationLog[],
  goal: HydrationGoal,
  centerDate: Date = new Date()
): HydrationData {
  const goalLiters = goal.daily_goal_ml / 1000;
  const weekDates = getWeekDates(centerDate);
  const today = formatDateForAPI(new Date());

  // Grouper les logs par date
  const logsByDate = new Map<string, number>();

  logs.forEach(log => {
    const current = logsByDate.get(log.date) || 0;
    logsByDate.set(log.date, current + log.amount_ml);
  });

  // Construire l'historique de 7 jours
  const history: HydrationDayEntry[] = weekDates.map(date => {
    const dateStr = formatDateForAPI(date);
    const amountMl = logsByDate.get(dateStr) || 0;
    const valueLiters =
      amountMl > 0 ? Math.round((amountMl / 1000) * 100) / 100 : null;

    return {
      date: dateStr,
      dayLabel: formatDayLabel(date),
      value: valueLiters,
      goal: goalLiters,
    };
  });

  // Calculer les statistiques
  const daysWithData = history.filter(day => day.value !== null);

  const totalConsumption = daysWithData.reduce(
    (sum, day) => sum + (day.value || 0),
    0
  );
  const weekAverage =
    daysWithData.length > 0
      ? Math.round((totalConsumption / daysWithData.length) * 100) / 100
      : 0;

  const daysWithGoalReached = daysWithData.filter(
    day => day.value! >= day.goal
  ).length;

  // Trouver la consommation d'aujourd'hui
  const todayEntry = history.find(day => day.date === today);
  const todayValue = todayEntry?.value || 0;

  return {
    today: todayValue,
    goal: goalLiters,
    weekAverage,
    daysWithGoalReached,
    totalDays: daysWithData.length,
    history,
  };
}

/**
 * Transforme les logs API pour une semaine donnée
 * Version simplifiée qui retourne directement les logs par date
 *
 * @param logsResponse - Réponse API avec logs
 * @param startDate - Date de début de semaine
 * @returns Map de logs par date
 */
export function groupLogsByDate(
  logs: HydrationLog[]
): Map<string, HydrationLog[]> {
  const grouped = new Map<string, HydrationLog[]>();

  logs.forEach(log => {
    const existing = grouped.get(log.date) || [];
    grouped.set(log.date, [...existing, log]);
  });

  return grouped;
}

/**
 * Calcule le pourcentage d'atteinte de l'objectif
 *
 * @param currentMl - Consommation actuelle (ml)
 * @param goalMl - Objectif (ml)
 * @returns Pourcentage (0-100+)
 */
export function calculateHydrationPercentage(
  currentMl: number,
  goalMl: number
): number {
  if (goalMl === 0) return 0;
  return Math.round((currentMl / goalMl) * 100);
}

/**
 * Convertit millilitres en litres avec formatage
 *
 * @param ml - Montant en millilitres
 * @param decimals - Nombre de décimales (défaut = 2)
 * @returns Montant en litres
 */
export function mlToLiters(ml: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((ml / 1000) * factor) / factor;
}

/**
 * Convertit litres en millilitres
 *
 * @param liters - Montant en litres
 * @returns Montant en millilitres (entier)
 */
export function litersToMl(liters: number): number {
  return Math.round(liters * 1000);
}
