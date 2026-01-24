/**
 * Types pour le Suivi Biométrique
 *
 * SUIVI-001: Page de suivi avec 5 onglets
 * - Poids: Suivi du poids avec graphique d'évolution
 * - Mensurations: Tour de poitrine, taille, hanches, cuisses, bras
 * - Bien-être: Énergie, sommeil, humeur, digestion
 * - Activité: Sessions, durée, calories
 * - Hydratation: Consommation d'eau quotidienne
 */

// ==================== ENUMS ====================

export type SuiviTab = 'poids' | 'mensurations' | 'bien-etre' | 'activite' | 'hydratation';

export type TimeRange = '1S' | '1M' | '3M' | '6M' | '1A' | 'Tout';

export type WeightTrend = 'up' | 'down' | 'stable';

export type MeasurementType = 'poitrine' | 'taille' | 'hanches' | 'cuisse' | 'bras' | 'mollet';

export type MoodType = 'great' | 'good' | 'neutral' | 'low' | 'bad';

export type DigestionType = 'normal' | 'bloating' | 'constipation' | 'diarrhea' | 'cramps';

export type ActivityType = 'running' | 'cycling' | 'gym' | 'swimming' | 'yoga' | 'other';

export type Intensity = 'low' | 'moderate' | 'high';

export type AddModalType = 'weight' | 'measurement' | 'activity' | null;

// ==================== WEIGHT INTERFACES ====================

export interface WeightEntry {
  id: string;
  date: Date;
  value: number;
}

export interface WeightData {
  current: number;
  initial: number;
  goal: number;
  change: number;
  changePercent: number;
  trend: WeightTrend;
  weeklyChange: number;
  history: WeightEntry[];
}

// ==================== MEASUREMENTS INTERFACES ====================

export interface MeasurementEntry {
  id: string;
  type: MeasurementType;
  date: Date;
  value: number;
}

export interface Measurement {
  id: string;
  type: MeasurementType;
  label: string;
  current: number;
  initial: number;
  unit: string;
  change: number;
  lastUpdated: Date;
}

export interface MeasurementsData {
  totalChange: number;
  measurements: Measurement[];
  history: MeasurementEntry[];
}

// ==================== WELLBEING INTERFACES ====================

export interface WellbeingEntry {
  id: string;
  date: Date;
  energy: number;
  sleep: number;
  mood: MoodType;
  digestion: DigestionType;
}

// BIO-006: Types pour les insights automatiques
export type InsightType = 'positive' | 'warning' | 'info';

export interface WellbeingInsightData {
  id: string;
  type: InsightType;
  message: string;
  icon?: string;
}

export interface WellbeingData {
  today: WellbeingEntry | null;
  history: WellbeingEntry[];
  insights: WellbeingInsightData[];
}

// ==================== ACTIVITY INTERFACES ====================

export interface ActivityEntry {
  id: string;
  date: Date;
  type: ActivityType;
  typeName: string;
  duration: number;
  intensity: Intensity;
  calories: number;
}

export interface WeeklyActivitySummary {
  sessions: number;
  totalMinutes: number;
  calories: number;
  goalSessions: number;
}

export interface ActivityData {
  thisWeek: WeeklyActivitySummary;
  activities: ActivityEntry[];
}

// ==================== HYDRATION INTERFACES ====================

export interface HydrationDayEntry {
  date: string;
  dayLabel: string;
  value: number | null;
  goal: number;
}

export interface HydrationData {
  today: number;
  goal: number;
  weekAverage: number;
  daysWithGoalReached: number;
  totalDays: number;
  history: HydrationDayEntry[];
}

// ==================== STATE ====================

export interface SuiviState {
  activeTab: SuiviTab;
  timeRange: TimeRange;
  showAddModal: boolean;
  modalType: AddModalType;
}

// ==================== ACTIONS ====================

export type SuiviAction =
  | { type: 'SET_TAB'; tab: SuiviTab }
  | { type: 'SET_TIME_RANGE'; range: TimeRange }
  | { type: 'OPEN_ADD_MODAL'; modalType: Exclude<AddModalType, null> }
  | { type: 'CLOSE_ADD_MODAL' };

// ==================== INITIAL STATE ====================

export const initialSuiviState: SuiviState = {
  activeTab: 'poids',
  timeRange: '1M',
  showAddModal: false,
  modalType: null,
};

// ==================== REDUCER ====================

export function suiviReducer(state: SuiviState, action: SuiviAction): SuiviState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.range };
    case 'OPEN_ADD_MODAL':
      return { ...state, showAddModal: true, modalType: action.modalType };
    case 'CLOSE_ADD_MODAL':
      return { ...state, showAddModal: false, modalType: null };
    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================

export const tabsConfig: { id: SuiviTab; label: string; icon: string }[] = [
  { id: 'poids', label: 'Poids', icon: '⚖️' },
  { id: 'mensurations', label: 'Mensurations', icon: '📏' },
  { id: 'bien-etre', label: 'Bien-être', icon: '😊' },
  { id: 'activite', label: 'Activité', icon: '🏃' },
  { id: 'hydratation', label: 'Hydratation', icon: '💧' },
];

export const timeRangesConfig: TimeRange[] = ['1S', '1M', '3M', '6M', '1A', 'Tout'];

export const moodConfig: Record<MoodType, { emoji: string; label: string }> = {
  great: { emoji: '😄', label: 'Excellent' },
  good: { emoji: '😊', label: 'Bien' },
  neutral: { emoji: '😐', label: 'Neutre' },
  low: { emoji: '😔', label: 'Bas' },
  bad: { emoji: '😢', label: 'Difficile' },
};

export const digestionConfig: { id: DigestionType; label: string; emoji: string }[] = [
  { id: 'normal', label: 'Normal', emoji: '✓' },
  { id: 'bloating', label: 'Ballonnements', emoji: '🎈' },
  { id: 'constipation', label: 'Constipation', emoji: '⏸' },
  { id: 'diarrhea', label: 'Diarrhée', emoji: '⚡' },
  { id: 'cramps', label: 'Crampes', emoji: '😫' },
];

export const activityTypeConfig: Record<
  ActivityType,
  { label: string; icon: string; bgColor: string; textColor: string }
> = {
  running: { label: 'Course', icon: '🏃', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  cycling: { label: 'Vélo', icon: '🚴', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  gym: { label: 'Musculation', icon: '🏋️', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  swimming: { label: 'Natation', icon: '🏊', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
  yoga: { label: 'Yoga', icon: '🧘', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
  other: { label: 'Autre', icon: '✨', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
};

export const intensityConfig: Record<Intensity, { label: string; bgColor: string; textColor: string }> = {
  low: { label: 'Basse', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  moderate: { label: 'Modérée', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  high: { label: 'Haute', bgColor: 'bg-red-100', textColor: 'text-red-700' },
};

// BIO-007: Valeurs MET (Metabolic Equivalent of Task) par type d'activité
// Source: Compendium of Physical Activities (Ainsworth et al.)
export const activityMETValues: Record<ActivityType, number> = {
  running: 9.8,    // Course à pied (8 km/h)
  cycling: 7.5,    // Vélo modéré
  gym: 6.0,        // Musculation
  swimming: 8.0,   // Natation
  yoga: 3.0,       // Yoga/Stretching
  other: 4.0,      // Activité générale
};

// BIO-007: Coefficients d'intensité
export const intensityFactors: Record<Intensity, number> = {
  low: 0.8,
  moderate: 1.0,
  high: 1.3,
};

/**
 * BIO-007: Calcule les calories brûlées pour une activité
 * Formule: calories = MET × poids(kg) × durée(h) × facteur_intensité
 * @param type - Type d'activité
 * @param durationMinutes - Durée en minutes
 * @param intensity - Niveau d'intensité
 * @param weightKg - Poids en kg (défaut: 75kg)
 */
export function calculateActivityCalories(
  type: ActivityType,
  durationMinutes: number,
  intensity: Intensity,
  weightKg: number = 75
): number {
  const met = activityMETValues[type];
  const intensityFactor = intensityFactors[intensity];
  const durationHours = durationMinutes / 60;

  const calories = met * weightKg * durationHours * intensityFactor;
  return Math.round(calories);
}

export const measurementTypeConfig: Record<MeasurementType, { label: string; order: number }> = {
  poitrine: { label: 'Tour de poitrine', order: 1 },
  taille: { label: 'Tour de taille', order: 2 },
  hanches: { label: 'Tour de hanches', order: 3 },
  cuisse: { label: 'Tour de cuisse', order: 4 },
  bras: { label: 'Tour de bras', order: 5 },
  mollet: { label: 'Tour de mollet', order: 6 },
};

// ==================== HELPERS ====================

/**
 * Calcule le pourcentage de progression vers l'objectif de poids
 */
export function calculateWeightProgress(initial: number, current: number, goal: number): number {
  if (initial === goal) return 100;
  const totalChange = initial - goal;
  const actualChange = initial - current;
  return Math.min(Math.max(Math.round((actualChange / totalChange) * 100), 0), 100);
}

/**
 * Détermine la couleur de tendance du poids
 */
export function getWeightTrendColor(trend: WeightTrend, isLoss: boolean): string {
  if (trend === 'stable') return 'text-gray-500';
  if ((trend === 'down' && isLoss) || (trend === 'up' && !isLoss)) {
    return 'text-emerald-600';
  }
  return 'text-amber-600';
}

/**
 * Formate une entrée de poids pour l'affichage
 */
export function formatWeightEntry(entry: WeightEntry): string {
  return `${entry.value.toFixed(1)} kg`;
}

/**
 * Calcule la variation entre deux pesées
 */
export function calculateWeightVariation(current: number, previous: number): {
  value: number;
  direction: 'up' | 'down' | 'stable';
  formatted: string;
} {
  const diff = current - previous;
  const direction = diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'stable';
  const formatted = direction === 'stable' ? '=' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`;
  return { value: Math.abs(diff), direction, formatted };
}

/**
 * Formate une date pour l'affichage
 */
export function formatSuiviDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formate une date complète
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calcule le pourcentage d'hydratation
 */
export function calculateHydrationPercentage(current: number, goal: number): number {
  return Math.min(Math.round((current / goal) * 100), 100);
}

/**
 * Formate la durée d'activité
 */
export function formatActivityDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}
