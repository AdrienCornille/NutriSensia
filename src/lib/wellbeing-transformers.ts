/**
 * Transformers pour le module Bien-être (Wellbeing)
 * Conversions entre types UI et types API (Database)
 */

import type {
  WellbeingEntry,
  WellbeingData,
  WellbeingInsightData,
  MoodType,
  DigestionType,
} from '@/types/suivi';

// ============================================================================
// TYPES API (Format Database)
// ============================================================================

export type MoodAPI = 'very_good' | 'good' | 'neutral' | 'bad' | 'very_bad';
export type DigestionQualityAPI = 'poor' | 'average' | 'good' | 'excellent';

export interface WellbeingLogAPI {
  id: string;
  patient_id: string;
  date: string; // 'YYYY-MM-DD'
  energy_level: number; // 1-10
  sleep_quality: number | null; // 1-10 (peut être null si non renseigné)
  sleep_hours: number | null; // float heures (nouveau champ)
  mood: MoodAPI | null;
  digestion: DigestionQualityAPI | null;
  symptoms: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WellbeingLogsResponse {
  logs: WellbeingLogAPI[];
  count: number;
}

// ============================================================================
// MAPPINGS: UI ↔ API
// ============================================================================

/**
 * Mapping Mood: UI → API
 */
export const moodUItoAPI: Record<MoodType, MoodAPI> = {
  great: 'very_good',
  good: 'good',
  neutral: 'neutral',
  low: 'bad',
  bad: 'very_bad',
};

/**
 * Mapping Mood: API → UI
 */
export const moodAPItoUI: Record<MoodAPI, MoodType> = {
  very_good: 'great',
  good: 'good',
  neutral: 'neutral',
  bad: 'low',
  very_bad: 'bad',
};

// ============================================================================
// CONVERSIONS: Énergie (UI 1-5 ↔ API 1-10)
// ============================================================================

/**
 * Convertit le niveau d'énergie UI (1-5) vers API (1-10)
 */
export function energyUItoAPI(energyUI: number): number {
  return energyUI * 2; // 1→2, 2→4, 3→6, 4→8, 5→10
}

/**
 * Convertit le niveau d'énergie API (1-10) vers UI (1-5)
 */
export function energyAPItoUI(energyAPI: number): number {
  return Math.ceil(energyAPI / 2); // 2→1, 4→2, 6→3, 8→4, 10→5
}

// ============================================================================
// CONVERSIONS: Digestion (Symptôme ↔ Qualité)
// ============================================================================

/**
 * Convertit un symptôme digestif UI vers une qualité DB
 */
export function digestionSymptomToQuality(
  symptom: DigestionType
): DigestionQualityAPI {
  const mapping: Record<DigestionType, DigestionQualityAPI> = {
    normal: 'excellent',
    bloating: 'average',
    constipation: 'poor',
    diarrhea: 'poor',
    cramps: 'poor',
  };
  return mapping[symptom];
}

/**
 * Convertit une qualité DB vers un symptôme UI
 * Utilise symptoms[] en priorité si disponible
 */
export function digestionQualityToSymptom(
  quality: DigestionQualityAPI | null,
  symptoms: string[] | null
): DigestionType {
  // Si symptoms[] contient un symptôme connu, l'utiliser
  if (symptoms && symptoms.length > 0) {
    const knownSymptoms: DigestionType[] = [
      'normal',
      'bloating',
      'constipation',
      'diarrhea',
      'cramps',
    ];
    const found = symptoms.find(s =>
      knownSymptoms.includes(s as DigestionType)
    );
    if (found) return found as DigestionType;
  }

  // Sinon, fallback basé sur quality
  if (quality === 'excellent' || quality === 'good') return 'normal';
  if (quality === 'average') return 'bloating';
  return 'constipation'; // poor → constipation par défaut
}

// ============================================================================
// CONVERSIONS: Sleep Quality (optionnel)
// ============================================================================

/**
 * Approxime la qualité de sommeil (1-10) basée sur les heures de sommeil
 * Utilisé si sleep_quality n'est pas fourni
 */
export function approximateSleepQuality(hours: number): number {
  if (hours < 5) return 2; // Très mauvais
  if (hours < 6) return 4; // Mauvais
  if (hours < 7) return 6; // Moyen
  if (hours < 8) return 8; // Bon
  if (hours <= 9) return 10; // Excellent
  return 7; // Trop de sommeil → moyen
}

// ============================================================================
// TRANSFORMATIONS: API → UI
// ============================================================================

/**
 * Transforme une entrée API en entrée UI
 */
export function transformWellbeingLogToEntry(
  log: WellbeingLogAPI
): WellbeingEntry {
  return {
    id: log.id,
    date: new Date(log.date),
    energy: energyAPItoUI(log.energy_level),
    sleep: log.sleep_hours ?? 7.0, // Fallback 7h si null
    mood: log.mood ? moodAPItoUI[log.mood] : 'neutral',
    digestion: digestionQualityToSymptom(log.digestion, log.symptoms),
  };
}

/**
 * Transforme un tableau de logs API en WellbeingData
 */
export function transformWellbeingData(logs: WellbeingLogAPI[]): WellbeingData {
  // Vérifier que logs n'est pas undefined ou null
  if (!logs || !Array.isArray(logs)) {
    return {
      today: null,
      history: [],
      insights: [],
    };
  }

  const history = logs.map(transformWellbeingLogToEntry);

  // Today = première entrée si c'est aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const todayEntry =
    history.find(entry => {
      const entryDate = entry.date.toISOString().split('T')[0];
      return entryDate === today;
    }) || null;

  // Générer insights (toujours appeler la fonction qui gère le cas < 14 jours)
  const insights = analyzeWellbeingInsights(history);

  return {
    today: todayEntry,
    history,
    insights,
  };
}

// ============================================================================
// ANALYSE DES INSIGHTS
// ============================================================================

/**
 * Analyse l'historique de bien-être et génère des insights personnalisés
 * Minimum 14 jours de données requis pour une analyse pertinente
 *
 * Copié depuis src/data/mock-suivi.ts (lines 313-430)
 */
export function analyzeWellbeingInsights(
  history: WellbeingEntry[]
): WellbeingInsightData[] {
  const insights: WellbeingInsightData[] = [];

  // Besoin de 14 jours minimum pour une analyse pertinente
  if (history.length < 14) {
    return [
      {
        id: 'insufficient-data',
        type: 'info',
        message:
          'Continuez à renseigner vos données quotidiennes pour obtenir des insights personnalisés.',
        icon: '📊',
      },
    ];
  }

  // 1. Corrélation sommeil/énergie
  const goodSleepDays = history.filter(e => e.sleep >= 7);
  const poorSleepDays = history.filter(e => e.sleep < 7);

  if (goodSleepDays.length > 0 && poorSleepDays.length > 0) {
    const avgEnergyGoodSleep =
      goodSleepDays.reduce((acc, e) => acc + e.energy, 0) /
      goodSleepDays.length;
    const avgEnergyPoorSleep =
      poorSleepDays.reduce((acc, e) => acc + e.energy, 0) /
      poorSleepDays.length;

    if (avgEnergyGoodSleep - avgEnergyPoorSleep >= 0.8) {
      insights.push({
        id: 'sleep-energy-correlation',
        type: 'positive',
        message: `Votre niveau d'énergie est en moyenne ${(
          avgEnergyGoodSleep - avgEnergyPoorSleep
        ).toFixed(
          1
        )} points plus élevé les jours où vous dormez 7h ou plus. Maintenez ce bon rythme de sommeil !`,
        icon: '😴',
      });
    }
  }

  // 2. Analyse des problèmes digestifs récurrents
  const digestionIssues = history.filter(e => e.digestion !== 'normal');
  const issueRate = (digestionIssues.length / history.length) * 100;

  if (issueRate >= 25) {
    // Identifier le problème le plus fréquent
    const issueTypes: Record<string, number> = {};
    digestionIssues.forEach(e => {
      issueTypes[e.digestion] = (issueTypes[e.digestion] || 0) + 1;
    });
    const mostFrequent = Object.entries(issueTypes).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const issueLabels: Record<string, string> = {
      bloating: 'ballonnements',
      constipation: 'constipation',
      diarrhea: 'diarrhée',
      cramps: 'crampes',
    };

    insights.push({
      id: 'digestion-warning',
      type: 'warning',
      message: `${Math.round(
        issueRate
      )}% de vos jours présentent des troubles digestifs, principalement des ${
        issueLabels[mostFrequent[0]] || mostFrequent[0]
      }. Pensez à en discuter avec votre nutritionniste.`,
      icon: '🍽️',
    });
  }

  // 3. Tendance de l'humeur (amélioration/dégradation)
  const recentWeek = history.slice(0, 7);
  const previousWeek = history.slice(7, 14);

  const moodScores: Record<MoodType, number> = {
    great: 5,
    good: 4,
    neutral: 3,
    low: 2,
    bad: 1,
  };

  const avgMoodRecent =
    recentWeek.reduce((acc, e) => acc + moodScores[e.mood], 0) /
    recentWeek.length;
  const avgMoodPrevious =
    previousWeek.reduce((acc, e) => acc + moodScores[e.mood], 0) /
    previousWeek.length;

  if (avgMoodRecent - avgMoodPrevious >= 0.5) {
    insights.push({
      id: 'mood-improving',
      type: 'positive',
      message:
        "Votre humeur s'améliore cette semaine par rapport à la précédente. Continuez ainsi !",
      icon: '📈',
    });
  } else if (avgMoodPrevious - avgMoodRecent >= 0.5) {
    insights.push({
      id: 'mood-declining',
      type: 'warning',
      message:
        "Votre humeur semble en baisse cette semaine. Prenez soin de vous et n'hésitez pas à en parler.",
      icon: '💬',
    });
  }

  // 4. Moyenne de sommeil insuffisante
  const avgSleep =
    history.reduce((acc, e) => acc + e.sleep, 0) / history.length;
  if (avgSleep < 7) {
    insights.push({
      id: 'sleep-deficit',
      type: 'warning',
      message: `Votre moyenne de sommeil est de ${avgSleep.toFixed(
        1
      )}h sur les 2 dernières semaines. L'objectif recommandé est de 7-8h pour une énergie optimale.`,
      icon: '⏰',
    });
  } else if (avgSleep >= 7.5) {
    insights.push({
      id: 'sleep-good',
      type: 'positive',
      message: `Votre moyenne de sommeil de ${avgSleep.toFixed(
        1
      )}h est excellente. Le sommeil est un pilier essentiel de votre bien-être !`,
      icon: '🌙',
    });
  }

  // Si aucun insight détecté, message encourageant
  if (insights.length === 0) {
    insights.push({
      id: 'all-good',
      type: 'info',
      message:
        'Vos indicateurs de bien-être sont stables. Continuez à maintenir ces bonnes habitudes !',
      icon: '✨',
    });
  }

  return insights;
}
