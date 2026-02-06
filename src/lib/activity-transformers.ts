/**
 * Transformers pour le module Activité physique (BIO-007)
 *
 * Ce fichier gère les conversions entre :
 * - Types UI (frontend) : Intensity = 'low' | 'moderate' | 'high'
 * - Types API (backend) : Intensity = 'light' | 'moderate' | 'vigorous' | 'very_vigorous'
 */

import type { ActivityEntry, ActivityType, Intensity } from '@/types/suivi';

// ============================================================================
// TYPES API
// ============================================================================

// Aligné avec l'enum PostgreSQL activity_intensity
export type IntensityAPI = 'light' | 'moderate' | 'vigorous' | 'very_vigorous';

// Aligné avec le schema Zod activityTypeEnum dans api-schemas.ts
export type ActivityTypeAPI =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'gym'
  | 'yoga'
  | 'pilates'
  | 'sports'
  | 'dancing'
  | 'hiking'
  | 'other';

// Type d'activité tel que retourné par la jointure avec activity_types
export interface ActivityTypeRecord {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string | null;
  met_value: number;
  emoji: string | null;
  bg_color: string | null;
  text_color: string | null;
}

export interface ActivityLogAPI {
  id: string;
  user_id: string;
  activity_type_id: string; // UUID référence vers activity_types
  activity_type?: ActivityTypeRecord; // Jointure optionnelle
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  intensity: IntensityAPI;
  calories_burned: number | null;
  notes: string | null;
  start_time: string | null;
  end_time: string | null;
  distance_km: number | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLogAPI[];
  count: number;
}

export interface WeeklyActivityStatsAPI {
  sessions: number;
  total_minutes: number;
  total_calories: number;
  goal_sessions: number;
  goal_minutes: number;
}

// ============================================================================
// MAPPINGS INTENSITY : UI <-> API
// ============================================================================

/**
 * Mapping UI → API pour l'intensité
 * low → light
 * moderate → moderate
 * high → vigorous
 */
export const intensityUItoAPI: Record<Intensity, IntensityAPI> = {
  low: 'light',
  moderate: 'moderate',
  high: 'vigorous',
};

/**
 * Mapping API → UI pour l'intensité
 * light → low
 * moderate → moderate
 * vigorous → high
 * very_vigorous → high
 */
export const intensityAPItoUI: Record<IntensityAPI, Intensity> = {
  light: 'low',
  moderate: 'moderate',
  vigorous: 'high',
  very_vigorous: 'high',
};

// ============================================================================
// MAPPINGS ACTIVITY TYPE : UI <-> API
// ============================================================================

/**
 * Types d'activité supportés par le frontend (slugs de activity_types)
 * Le frontend ne supporte que 6 types, les autres sont mappés vers 'other'
 */
const supportedUITypes: ActivityType[] = [
  'running',
  'cycling',
  'gym',
  'swimming',
  'yoga',
  'other',
];

/**
 * Mapping des slugs API non supportés vers 'other'
 */
const activitySlugToUIMap: Record<string, ActivityType> = {
  running: 'running',
  cycling: 'cycling',
  gym: 'gym',
  swimming: 'swimming',
  yoga: 'yoga',
  walking: 'other', // walking n'est pas dans le frontend
  pilates: 'yoga', // pilates proche de yoga
  sports: 'other',
  dancing: 'other',
  dance: 'other',
  hiking: 'other',
  tennis: 'other',
  climbing: 'other',
  other: 'other',
};

/**
 * Mapping UI → slug API (direct car les 6 types UI existent dans l'API)
 * Le type de retour correspond exactement aux slugs attendus par l'API
 */
export function activityTypeUItoAPI(type: ActivityType): ActivityTypeAPI {
  // Les types UI correspondent directement aux slugs API
  return type as ActivityTypeAPI;
}

/**
 * Mapping slug API → UI
 */
export function activityTypeAPItoUI(slug: string | undefined): ActivityType {
  if (!slug) return 'other';
  return activitySlugToUIMap[slug] || 'other';
}

// ============================================================================
// LABELS POUR AFFICHAGE
// ============================================================================

const activityTypeLabels: Record<string, string> = {
  running: 'Course',
  cycling: 'Vélo',
  gym: 'Musculation',
  swimming: 'Natation',
  yoga: 'Yoga',
  walking: 'Marche',
  pilates: 'Pilates',
  sports: 'Sports',
  dancing: 'Danse',
  dance: 'Danse',
  hiking: 'Randonnée',
  tennis: 'Tennis',
  climbing: 'Escalade',
  other: 'Autre',
};

export function getActivityTypeLabel(slug: string): string {
  return activityTypeLabels[slug] || 'Autre';
}

// ============================================================================
// TRANSFORMERS : API → UI
// ============================================================================

/**
 * Transforme un log d'activité API en entrée UI
 */
export function transformActivityLogToEntry(
  log: ActivityLogAPI
): ActivityEntry {
  // Récupérer le slug du type d'activité depuis la jointure ou utiliser 'other'
  const activitySlug = log.activity_type?.slug || 'other';
  const activityName =
    log.activity_type?.name_fr || getActivityTypeLabel(activitySlug);

  return {
    id: log.id,
    date: new Date(log.date),
    type: activityTypeAPItoUI(activitySlug),
    typeName: activityName,
    duration: log.duration_minutes,
    intensity: intensityAPItoUI[log.intensity],
    calories: log.calories_burned || 0,
  };
}

/**
 * Transforme un tableau de logs API en données d'activité UI
 */
export function transformActivityData(
  logs: ActivityLogAPI[],
  weeklyStats?: WeeklyActivityStatsAPI
): {
  activities: ActivityEntry[];
  thisWeek: {
    sessions: number;
    totalMinutes: number;
    calories: number;
    goalSessions: number;
  };
} {
  if (!logs || !Array.isArray(logs)) {
    return {
      activities: [],
      thisWeek: {
        sessions: 0,
        totalMinutes: 0,
        calories: 0,
        goalSessions: 3,
      },
    };
  }

  const activities = logs.map(transformActivityLogToEntry);

  // Calculer les stats de la semaine (7 derniers jours pour être cohérent avec les autres modules)
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6); // 7 derniers jours incluant aujourd'hui
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Utiliser les dates string pour éviter les problèmes de timezone
  const nowStr = now.toISOString().split('T')[0];
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  // Filtrer sur les 7 derniers jours en comparant les strings de date
  const thisWeekActivities = logs
    .filter(log => {
      const logDate = log.date; // Format YYYY-MM-DD
      return logDate >= sevenDaysAgoStr && logDate <= nowStr;
    })
    .map(transformActivityLogToEntry);

  const thisWeek = weeklyStats
    ? {
        sessions: weeklyStats.sessions,
        totalMinutes: weeklyStats.total_minutes,
        calories: weeklyStats.total_calories,
        goalSessions: weeklyStats.goal_sessions || 3,
      }
    : {
        sessions: thisWeekActivities.length,
        totalMinutes: thisWeekActivities.reduce(
          (sum, a) => sum + a.duration,
          0
        ),
        calories: thisWeekActivities.reduce((sum, a) => sum + a.calories, 0),
        goalSessions: 3,
      };

  return {
    activities,
    thisWeek,
  };
}

// ============================================================================
// TRANSFORMERS : UI → API (pour les mutations)
// ============================================================================

export interface CreateActivityUI {
  type: ActivityType;
  duration: number;
  intensity: Intensity;
  calories?: number;
  notes?: string;
  date?: Date;
}

/**
 * Transforme les données UI en format API pour création
 * Note: activity_type est le slug qui sera utilisé pour trouver l'activity_type_id
 */
export function transformActivityUItoAPI(data: CreateActivityUI): {
  activity_type: string;
  duration_minutes: number;
  intensity: IntensityAPI;
  calories_burned?: number;
  notes?: string;
  date?: string;
} {
  return {
    activity_type: activityTypeUItoAPI(data.type),
    duration_minutes: data.duration,
    intensity: intensityUItoAPI[data.intensity],
    ...(data.calories && { calories_burned: data.calories }),
    ...(data.notes && { notes: data.notes }),
    ...(data.date && { date: data.date.toISOString().split('T')[0] }),
  };
}
