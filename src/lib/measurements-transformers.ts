/**
 * Transformations pour le module Mensurations
 * Conversion entre types API et types UI
 */

import type {
  MeasurementType,
  MeasurementEntry,
  Measurement,
  MeasurementsData,
} from '@/types/suivi';
import { measurementTypeConfig } from '@/types/suivi';

// ============================================================================
// TYPES API
// ============================================================================

export interface MeasurementEntryAPI {
  id: string;
  user_id: string;
  measurement_type: MeasurementType;
  value_cm: number;
  date: string; // 'YYYY-MM-DD'
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MeasurementsResponse {
  measurements: MeasurementEntryAPI[];
  statistics: {
    total_change_cm: number;
    measurements_count: number;
    types_measured: number;
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Groupe les mesures par type
 */
export function groupMeasurementsByType(
  measurements: MeasurementEntryAPI[]
): Map<MeasurementType, MeasurementEntryAPI[]> {
  const grouped = new Map<MeasurementType, MeasurementEntryAPI[]>();

  measurements.forEach(measurement => {
    const existing = grouped.get(measurement.measurement_type) || [];
    grouped.set(measurement.measurement_type, [...existing, measurement]);
  });

  // Trier chaque groupe par date décroissante
  grouped.forEach((entries, type) => {
    grouped.set(
      type,
      entries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  });

  return grouped;
}

/**
 * Calcule le changement pour un type de mesure
 * @returns current - initial (positif = augmentation, négatif = diminution)
 */
export function calculateMeasurementChange(
  entries: MeasurementEntryAPI[]
): number {
  if (entries.length < 2) return 0;

  // entries est déjà trié par date décroissante
  const current = entries[0].value_cm;
  const initial = entries[entries.length - 1].value_cm;

  return Number((current - initial).toFixed(1));
}

/**
 * Formate une valeur de mesure
 */
export function formatMeasurementValue(valueCm: number): string {
  return `${valueCm.toFixed(1)} cm`;
}

/**
 * Formate un changement de mesure avec signe
 */
export function formatMeasurementChange(changeCm: number): string {
  const sign = changeCm > 0 ? '+' : '';
  return `${sign}${changeCm.toFixed(1)} cm`;
}

// ============================================================================
// TRANSFORMATIONS PRINCIPALES
// ============================================================================

/**
 * Transforme les entrées API en historique UI
 */
export function transformMeasurementEntries(
  entries: MeasurementEntryAPI[]
): MeasurementEntry[] {
  return entries.map(entry => ({
    id: entry.id,
    type: entry.measurement_type,
    date: new Date(entry.date),
    value: entry.value_cm,
  }));
}

/**
 * Transforme la réponse API complète en données UI
 */
export function transformMeasurementsToData(
  measurements: MeasurementEntryAPI[]
): MeasurementsData {
  // Si aucune mesure, retourner état vide
  if (measurements.length === 0) {
    return {
      totalChange: 0,
      measurements: [],
      history: [],
    };
  }

  // Grouper par type
  const groupedByType = groupMeasurementsByType(measurements);

  // Créer tableau de Measurement pour chaque type mesuré
  const measurementsArray: Measurement[] = [];
  let totalChange = 0;

  groupedByType.forEach((entries, type) => {
    if (entries.length === 0) return;

    const current = entries[0].value_cm;
    const initial = entries[entries.length - 1].value_cm;
    const change = calculateMeasurementChange(entries);
    const lastUpdated = new Date(entries[0].date);

    measurementsArray.push({
      id: entries[0].id,
      type,
      label: measurementTypeConfig[type].label,
      current,
      initial,
      unit: 'cm',
      change,
      lastUpdated,
    });

    // Ajouter la valeur absolue du changement au total
    totalChange += Math.abs(change);
  });

  // Trier les mesures par ordre de configuration
  measurementsArray.sort((a, b) => {
    return (
      measurementTypeConfig[a.type].order - measurementTypeConfig[b.type].order
    );
  });

  // Convertir l'historique
  const history = transformMeasurementEntries(measurements);

  // Trier l'historique par date décroissante
  history.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    totalChange: Number(totalChange.toFixed(1)),
    measurements: measurementsArray,
    history,
  };
}

/**
 * Calcule les statistiques pour une réponse API
 */
export function calculateMeasurementsStatistics(
  measurements: MeasurementEntryAPI[]
): {
  total_change_cm: number;
  measurements_count: number;
  types_measured: number;
} {
  const groupedByType = groupMeasurementsByType(measurements);
  let totalChange = 0;

  groupedByType.forEach(entries => {
    const change = calculateMeasurementChange(entries);
    totalChange += Math.abs(change);
  });

  return {
    total_change_cm: Number(totalChange.toFixed(1)),
    measurements_count: measurements.length,
    types_measured: groupedByType.size,
  };
}
