/**
 * Mock data pour le Suivi Biométrique
 */

import type {
  WeightData,
  WeightEntry,
  MeasurementsData,
  Measurement,
  WellbeingData,
  WellbeingEntry,
  WellbeingInsightData,
  InsightType,
  ActivityData,
  ActivityEntry,
  HydrationData,
  HydrationDayEntry,
  TimeRange,
  MoodType,
  DigestionType,
  ActivityType,
  Intensity,
  MeasurementType,
} from '@/types/suivi';

// ==================== WEIGHT DATA ====================

const weightHistory: WeightEntry[] = [
  { id: 'w1', date: new Date('2026-01-17'), value: 78.4 },
  { id: 'w2', date: new Date('2026-01-15'), value: 78.6 },
  { id: 'w3', date: new Date('2026-01-12'), value: 78.9 },
  { id: 'w4', date: new Date('2026-01-10'), value: 79.1 },
  { id: 'w5', date: new Date('2026-01-08'), value: 79.0 },
  { id: 'w6', date: new Date('2026-01-05'), value: 79.4 },
  { id: 'w7', date: new Date('2026-01-03'), value: 79.8 },
  { id: 'w8', date: new Date('2026-01-01'), value: 80.0 },
  { id: 'w9', date: new Date('2025-12-28'), value: 80.3 },
  { id: 'w10', date: new Date('2025-12-25'), value: 80.5 },
  { id: 'w11', date: new Date('2025-12-20'), value: 80.8 },
  { id: 'w12', date: new Date('2025-12-15'), value: 81.2 },
  { id: 'w13', date: new Date('2025-12-10'), value: 81.5 },
  { id: 'w14', date: new Date('2025-12-01'), value: 82.0 },
];

export function getWeightData(timeRange: TimeRange): WeightData {
  const now = new Date();
  let filteredHistory = [...weightHistory];

  // Filter based on time range
  const daysMap: Record<TimeRange, number> = {
    '1S': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1A': 365,
    Tout: Infinity,
  };

  const days = daysMap[timeRange];
  if (days !== Infinity) {
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    filteredHistory = weightHistory.filter(entry => entry.date >= cutoffDate);
  }

  const current = weightHistory[0].value;
  const initial = 82.0;
  const goal = 75.0;
  const change = current - initial;
  const changePercent = (change / initial) * 100;

  // Calculate weekly change (last 7 days)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoEntry = weightHistory.find(e => e.date <= weekAgo);
  const weeklyChange = weekAgoEntry ? current - weekAgoEntry.value : -0.4;

  return {
    current,
    initial,
    goal,
    change,
    changePercent,
    trend: change < -0.1 ? 'down' : change > 0.1 ? 'up' : 'stable',
    weeklyChange,
    history: filteredHistory,
  };
}

// ==================== MEASUREMENTS DATA ====================

const measurementsData: Measurement[] = [
  {
    id: 'm1',
    type: 'poitrine' as MeasurementType,
    label: 'Tour de poitrine',
    current: 98,
    initial: 100,
    unit: 'cm',
    change: -2,
    lastUpdated: new Date('2026-01-15'),
  },
  {
    id: 'm2',
    type: 'taille' as MeasurementType,
    label: 'Tour de taille',
    current: 84,
    initial: 89,
    unit: 'cm',
    change: -5,
    lastUpdated: new Date('2026-01-15'),
  },
  {
    id: 'm3',
    type: 'hanches' as MeasurementType,
    label: 'Tour de hanches',
    current: 96,
    initial: 98,
    unit: 'cm',
    change: -2,
    lastUpdated: new Date('2026-01-15'),
  },
  {
    id: 'm4',
    type: 'cuisse' as MeasurementType,
    label: 'Tour de cuisse',
    current: 56,
    initial: 58,
    unit: 'cm',
    change: -2,
    lastUpdated: new Date('2026-01-15'),
  },
  {
    id: 'm5',
    type: 'bras' as MeasurementType,
    label: 'Tour de bras',
    current: 32,
    initial: 31,
    unit: 'cm',
    change: 1,
    lastUpdated: new Date('2026-01-15'),
  },
];

// Historique des mesures pour BIO-004
const measurementsHistory: {
  id: string;
  type: MeasurementType;
  date: Date;
  value: number;
}[] = [
  // Tour de taille (le plus suivi)
  { id: 'mh1', type: 'taille', date: new Date('2026-01-15'), value: 84 },
  { id: 'mh2', type: 'taille', date: new Date('2026-01-08'), value: 85 },
  { id: 'mh3', type: 'taille', date: new Date('2026-01-01'), value: 86 },
  { id: 'mh4', type: 'taille', date: new Date('2025-12-25'), value: 87 },
  { id: 'mh5', type: 'taille', date: new Date('2025-12-15'), value: 89 },
  // Tour de poitrine
  { id: 'mh6', type: 'poitrine', date: new Date('2026-01-15'), value: 98 },
  { id: 'mh7', type: 'poitrine', date: new Date('2026-01-01'), value: 99 },
  { id: 'mh8', type: 'poitrine', date: new Date('2025-12-15'), value: 100 },
  // Tour de hanches
  { id: 'mh9', type: 'hanches', date: new Date('2026-01-15'), value: 96 },
  { id: 'mh10', type: 'hanches', date: new Date('2026-01-01'), value: 97 },
  { id: 'mh11', type: 'hanches', date: new Date('2025-12-15'), value: 98 },
  // Tour de cuisse
  { id: 'mh12', type: 'cuisse', date: new Date('2026-01-15'), value: 56 },
  { id: 'mh13', type: 'cuisse', date: new Date('2025-12-15'), value: 58 },
  // Tour de bras
  { id: 'mh14', type: 'bras', date: new Date('2026-01-15'), value: 32 },
  { id: 'mh15', type: 'bras', date: new Date('2025-12-15'), value: 31 },
];

export function getMeasurementsData(): MeasurementsData {
  const totalChange = measurementsData.reduce((acc, m) => acc + m.change, 0);
  // Trier l'historique par date décroissante
  const sortedHistory = [...measurementsHistory].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  return {
    totalChange,
    measurements: measurementsData,
    history: sortedHistory,
  };
}

// ==================== WELLBEING DATA ====================

// BIO-006: Historique étendu à 14+ jours pour l'analyse des corrélations
const wellbeingHistory: WellbeingEntry[] = [
  // Semaine actuelle (13-17 janvier)
  {
    id: 'wb1',
    date: new Date('2026-01-17'),
    energy: 4,
    sleep: 7.5,
    mood: 'good' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb2',
    date: new Date('2026-01-16'),
    energy: 3,
    sleep: 6.0,
    mood: 'neutral' as MoodType,
    digestion: 'bloating' as DigestionType,
  },
  {
    id: 'wb3',
    date: new Date('2026-01-15'),
    energy: 5,
    sleep: 8.0,
    mood: 'great' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb4',
    date: new Date('2026-01-14'),
    energy: 4,
    sleep: 7.0,
    mood: 'good' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb5',
    date: new Date('2026-01-13'),
    energy: 2,
    sleep: 5.5,
    mood: 'low' as MoodType,
    digestion: 'cramps' as DigestionType,
  },
  // Semaine précédente (6-12 janvier)
  {
    id: 'wb6',
    date: new Date('2026-01-12'),
    energy: 4,
    sleep: 7.5,
    mood: 'good' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb7',
    date: new Date('2026-01-11'),
    energy: 3,
    sleep: 6.5,
    mood: 'neutral' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb8',
    date: new Date('2026-01-10'),
    energy: 2,
    sleep: 5.0,
    mood: 'low' as MoodType,
    digestion: 'bloating' as DigestionType,
  },
  {
    id: 'wb9',
    date: new Date('2026-01-09'),
    energy: 5,
    sleep: 8.5,
    mood: 'great' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb10',
    date: new Date('2026-01-08'),
    energy: 4,
    sleep: 7.0,
    mood: 'good' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb11',
    date: new Date('2026-01-07'),
    energy: 3,
    sleep: 6.0,
    mood: 'neutral' as MoodType,
    digestion: 'bloating' as DigestionType,
  },
  {
    id: 'wb12',
    date: new Date('2026-01-06'),
    energy: 4,
    sleep: 7.5,
    mood: 'good' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  // Début janvier (3-5 janvier)
  {
    id: 'wb13',
    date: new Date('2026-01-05'),
    energy: 2,
    sleep: 5.5,
    mood: 'low' as MoodType,
    digestion: 'cramps' as DigestionType,
  },
  {
    id: 'wb14',
    date: new Date('2026-01-04'),
    energy: 3,
    sleep: 6.5,
    mood: 'neutral' as MoodType,
    digestion: 'normal' as DigestionType,
  },
  {
    id: 'wb15',
    date: new Date('2026-01-03'),
    energy: 4,
    sleep: 7.0,
    mood: 'good' as MoodType,
    digestion: 'normal' as DigestionType,
  },
];

/**
 * BIO-006: Analyse automatique des corrélations bien-être
 * Détecte les patterns sur les 2 dernières semaines minimum
 */
function analyzeWellbeingInsights(
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
        message: `Votre niveau d'énergie est en moyenne ${(avgEnergyGoodSleep - avgEnergyPoorSleep).toFixed(1)} points plus élevé les jours où vous dormez 7h ou plus. Maintenez ce bon rythme de sommeil !`,
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
      message: `${Math.round(issueRate)}% de vos jours présentent des troubles digestifs, principalement des ${issueLabels[mostFrequent[0]] || mostFrequent[0]}. Pensez à en discuter avec votre nutritionniste.`,
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
      message: `Votre moyenne de sommeil est de ${avgSleep.toFixed(1)}h sur les 2 dernières semaines. L'objectif recommandé est de 7-8h pour une énergie optimale.`,
      icon: '⏰',
    });
  } else if (avgSleep >= 7.5) {
    insights.push({
      id: 'sleep-good',
      type: 'positive',
      message: `Votre moyenne de sommeil de ${avgSleep.toFixed(1)}h est excellente. Le sommeil est un pilier essentiel de votre bien-être !`,
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

export function getWellbeingData(): WellbeingData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntry = wellbeingHistory.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });

  // BIO-006: Générer les insights automatiques
  const insights = analyzeWellbeingInsights(wellbeingHistory);

  return {
    today: todayEntry || null,
    history: wellbeingHistory,
    insights,
  };
}

// ==================== ACTIVITY DATA ====================

const activityHistory: ActivityEntry[] = [
  {
    id: 'a1',
    date: new Date('2026-01-17'),
    type: 'running' as ActivityType,
    typeName: 'Course à pied',
    duration: 45,
    intensity: 'moderate' as Intensity,
    calories: 380,
  },
  {
    id: 'a2',
    date: new Date('2026-01-15'),
    type: 'gym' as ActivityType,
    typeName: 'Musculation',
    duration: 60,
    intensity: 'high' as Intensity,
    calories: 320,
  },
  {
    id: 'a3',
    date: new Date('2026-01-13'),
    type: 'yoga' as ActivityType,
    typeName: 'Yoga',
    duration: 45,
    intensity: 'low' as Intensity,
    calories: 120,
  },
  {
    id: 'a4',
    date: new Date('2026-01-10'),
    type: 'cycling' as ActivityType,
    typeName: 'Vélo',
    duration: 90,
    intensity: 'moderate' as Intensity,
    calories: 450,
  },
  {
    id: 'a5',
    date: new Date('2026-01-08'),
    type: 'swimming' as ActivityType,
    typeName: 'Natation',
    duration: 60,
    intensity: 'moderate' as Intensity,
    calories: 400,
  },
];

export function getActivityData(): ActivityData {
  // Filter activities from this week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekActivities = activityHistory.filter(
    activity => activity.date >= weekStart
  );

  const totalMinutes = thisWeekActivities.reduce(
    (acc, a) => acc + a.duration,
    0
  );
  const totalCalories = thisWeekActivities.reduce(
    (acc, a) => acc + a.calories,
    0
  );

  return {
    thisWeek: {
      sessions: thisWeekActivities.length,
      totalMinutes,
      calories: totalCalories,
      goalSessions: 4,
    },
    activities: activityHistory,
  };
}

// ==================== HYDRATION DATA ====================

const hydrationHistory: HydrationDayEntry[] = [
  { date: '2026-01-13', dayLabel: 'Lun', value: 2.0, goal: 2.0 },
  { date: '2026-01-14', dayLabel: 'Mar', value: 1.8, goal: 2.0 },
  { date: '2026-01-15', dayLabel: 'Mer', value: 2.2, goal: 2.0 },
  { date: '2026-01-16', dayLabel: 'Jeu', value: 1.5, goal: 2.0 },
  { date: '2026-01-17', dayLabel: 'Ven', value: 1.4, goal: 2.0 },
  { date: '2026-01-18', dayLabel: 'Sam', value: null, goal: 2.0 },
  { date: '2026-01-19', dayLabel: 'Dim', value: null, goal: 2.0 },
];

export function getHydrationData(): HydrationData {
  const today = hydrationHistory.find(h => h.dayLabel === 'Ven');
  const todayValue = today?.value || 0;
  const goal = 2.0;

  // Calculate week average (only days with data)
  const daysWithData = hydrationHistory.filter(h => h.value !== null);
  const weekAverage =
    daysWithData.length > 0
      ? daysWithData.reduce((acc, h) => acc + (h.value || 0), 0) /
        daysWithData.length
      : 0;

  // Calculate days with goal reached
  const daysWithGoalReached = daysWithData.filter(
    h => h.value !== null && h.value >= h.goal
  ).length;

  return {
    today: todayValue,
    goal,
    weekAverage: Math.round(weekAverage * 10) / 10,
    daysWithGoalReached,
    totalDays: daysWithData.length,
    history: hydrationHistory,
  };
}

// ==================== QUICK ADD OPTIONS ====================

export const hydrationQuickAddOptions = [
  { amount: 250, label: '1 verre', icon: '🥛' },
  { amount: 500, label: '1 bouteille', icon: '🧴' },
  { amount: 330, label: '1 canette', icon: '🥫' },
  { amount: 150, label: '1 tasse', icon: '☕' },
];

export const activityOptions: {
  type: ActivityType;
  label: string;
  icon: string;
}[] = [
  { type: 'running', label: 'Course', icon: '🏃' },
  { type: 'cycling', label: 'Vélo', icon: '🚴' },
  { type: 'gym', label: 'Musculation', icon: '🏋️' },
  { type: 'swimming', label: 'Natation', icon: '🏊' },
  { type: 'yoga', label: 'Yoga', icon: '🧘' },
  { type: 'other', label: 'Autre', icon: '✨' },
];

export const measurementOptions: { type: MeasurementType; label: string }[] = [
  { type: 'poitrine', label: 'Tour de poitrine' },
  { type: 'taille', label: 'Tour de taille' },
  { type: 'hanches', label: 'Tour de hanches' },
  { type: 'cuisse', label: 'Tour de cuisse' },
  { type: 'bras', label: 'Tour de bras' },
  { type: 'mollet', label: 'Tour de mollet' },
];
