/**
 * Utilitaires pour la manipulation et le formatage des dates
 */

import {
  format,
  isToday,
  isYesterday,
  isTomorrow,
  startOfWeek,
  addDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================================================
// FORMATAGE DES DATES
// ============================================================================

/**
 * Formate une date avec label contextuel (Aujourd'hui, Hier, Demain, ou date complète)
 * @param date - La date à formater
 * @returns Label formaté
 */
export function formatDateLabel(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return 'Hier';
  if (isTomorrow(date)) return 'Demain';

  // Format personnalisé: "Lundi 15 janvier 2024"
  return format(date, 'EEEE d MMMM yyyy', { locale: fr });
}

/**
 * Formate l'heure d'une date
 * @param date - La date dont extraire l'heure
 * @returns Heure formatée (ex: "14:30")
 */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Formate une date au format ISO (YYYY-MM-DD) pour l'API
 * @param date - La date à formater
 * @returns Date au format YYYY-MM-DD
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formate une date au format court (ex: "15 jan")
 * @param date - La date à formater
 * @returns Date formatée courte
 */
export function formatShortDate(date: Date): string {
  return format(date, 'd MMM', { locale: fr });
}

/**
 * Formate une date au format jour de la semaine (ex: "Lun")
 * @param date - La date à formater
 * @returns Jour de la semaine abrégé
 */
export function formatWeekday(date: Date): string {
  return format(date, 'EEE', { locale: fr });
}

// ============================================================================
// GÉNÉRATION DE PLAGES DE DATES
// ============================================================================

/**
 * Génère une plage de dates autour d'une date donnée
 * @param centerDate - Date centrale
 * @param beforeCount - Nombre de jours avant
 * @param afterCount - Nombre de jours après
 * @returns Tableau de dates
 */
export function generateDateRange(
  centerDate: Date,
  beforeCount: number = 7,
  afterCount: number = 7
): Date[] {
  const dates: Date[] = [];

  // Ajouter les jours avant
  for (let i = beforeCount; i > 0; i--) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  // Ajouter le jour central
  dates.push(new Date(centerDate));

  // Ajouter les jours après
  for (let i = 1; i <= afterCount; i++) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Génère les 7 jours d'une semaine à partir d'une date donnée
 * La semaine commence le lundi
 * @param date - Date de référence
 * @returns Tableau des 7 dates de la semaine
 */
export function getWeekDates(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // 1 = Lundi
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ============================================================================
// COMPARAISON DE DATES
// ============================================================================

/**
 * Vérifie si deux dates sont le même jour
 * @param date1 - Première date
 * @param date2 - Deuxième date
 * @returns true si les dates sont le même jour
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Vérifie si une date est dans le passé (avant aujourd'hui)
 * @param date - Date à vérifier
 * @returns true si la date est dans le passé
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Vérifie si une date est dans le futur (après aujourd'hui)
 * @param date - Date à vérifier
 * @returns true si la date est dans le futur
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}
