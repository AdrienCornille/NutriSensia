/**
 * Mock data pour la Gamification & Motivation
 */

import type { Badge, StreakData, Milestone } from '@/types/gamification';

// ==================== BADGES ====================

export const allBadges: Badge[] = [
  // Streak badges
  {
    id: 'first_meal',
    name: 'Premier pas',
    description: 'Enregistrez votre premier repas',
    icon: '🌱',
    category: 'nutrition',
    rarity: 'common',
    requirement: 'Enregistrer 1 repas',
    unlockedAt: new Date('2025-12-15'),
    progress: 100,
    maxProgress: 1,
  },
  {
    id: 'streak_7',
    name: 'En feu',
    description: '7 jours consécutifs d\'enregistrement',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    requirement: 'Maintenir un streak de 7 jours',
    unlockedAt: new Date('2025-12-22'),
    progress: 100,
    maxProgress: 7,
  },
  {
    id: 'streak_30',
    name: 'Imparable',
    description: '30 jours consécutifs d\'enregistrement',
    icon: '⚡',
    category: 'streak',
    rarity: 'epic',
    requirement: 'Maintenir un streak de 30 jours',
    unlockedAt: null,
    progress: 12,
    maxProgress: 30,
  },
  {
    id: 'hydration_7',
    name: 'Hydraté',
    description: 'Atteignez votre objectif hydratation 7 jours',
    icon: '💧',
    category: 'hydration',
    rarity: 'rare',
    requirement: 'Atteindre l\'objectif hydratation 7 jours',
    unlockedAt: new Date('2025-12-28'),
    progress: 100,
    maxProgress: 7,
  },
  {
    id: 'first_goal',
    name: 'Sur la bonne voie',
    description: 'Atteignez votre premier objectif de poids',
    icon: '🎯',
    category: 'milestone',
    rarity: 'epic',
    requirement: 'Atteindre un objectif de poids',
    unlockedAt: null,
    progress: 43,
    maxProgress: 100,
  },
  {
    id: 'photo_10',
    name: 'Photographe culinaire',
    description: 'Prenez 10 photos de vos repas',
    icon: '📸',
    category: 'nutrition',
    rarity: 'common',
    requirement: 'Prendre 10 photos de repas',
    unlockedAt: null,
    progress: 6,
    maxProgress: 10,
  },
  {
    id: 'first_message',
    name: 'Connecté',
    description: 'Envoyez votre premier message à votre nutritionniste',
    icon: '💬',
    category: 'social',
    rarity: 'common',
    requirement: 'Envoyer 1 message',
    unlockedAt: new Date('2025-12-16'),
    progress: 100,
    maxProgress: 1,
  },
  {
    id: 'early_bird',
    name: 'Lève-tôt',
    description: 'Enregistrez un petit-déjeuner avant 8h, 5 fois',
    icon: '🌅',
    category: 'nutrition',
    rarity: 'rare',
    requirement: 'Petit-déjeuner avant 8h, 5 fois',
    unlockedAt: null,
    progress: 2,
    maxProgress: 5,
  },
  {
    id: 'variety_master',
    name: 'Maître de la variété',
    description: 'Mangez 20 aliments différents en une semaine',
    icon: '🥗',
    category: 'nutrition',
    rarity: 'epic',
    requirement: '20 aliments différents en 7 jours',
    unlockedAt: null,
    progress: 14,
    maxProgress: 20,
  },
  {
    id: 'consistency_king',
    name: 'Roi de la constance',
    description: 'Enregistrez tous vos repas pendant 14 jours',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    requirement: 'Tous les repas pendant 14 jours',
    unlockedAt: null,
    progress: 8,
    maxProgress: 14,
  },
];

// ==================== STREAK DATA ====================

export const mockStreakData: StreakData = {
  current: 12,
  best: 18,
  lastRecordedDate: new Date(),
  isActive: true,
};

// ==================== RECENT MILESTONES ====================

export const mockMilestones: Milestone[] = [
  {
    id: '1',
    type: 'badge',
    title: 'Badge débloqué !',
    description: 'Vous avez obtenu le badge "Hydraté"',
    achievedAt: new Date('2025-12-28'),
    badge: allBadges.find((b) => b.id === 'hydration_7'),
  },
  {
    id: '2',
    type: 'streak',
    title: 'Streak de 7 jours !',
    description: 'Félicitations pour votre régularité',
    achievedAt: new Date('2025-12-22'),
    value: 7,
  },
  {
    id: '3',
    type: 'badge',
    title: 'Badge débloqué !',
    description: 'Vous avez obtenu le badge "En feu"',
    achievedAt: new Date('2025-12-22'),
    badge: allBadges.find((b) => b.id === 'streak_7'),
  },
  {
    id: '4',
    type: 'badge',
    title: 'Badge débloqué !',
    description: 'Vous avez obtenu le badge "Connecté"',
    achievedAt: new Date('2025-12-16'),
    badge: allBadges.find((b) => b.id === 'first_message'),
  },
  {
    id: '5',
    type: 'badge',
    title: 'Badge débloqué !',
    description: 'Vous avez obtenu le badge "Premier pas"',
    achievedAt: new Date('2025-12-15'),
    badge: allBadges.find((b) => b.id === 'first_meal'),
  },
];

// ==================== API FUNCTIONS (MOCK) ====================

/**
 * Récupère tous les badges
 */
export function getBadges(): Badge[] {
  return [...allBadges];
}

/**
 * Récupère les données de streak
 */
export function getStreakData(): StreakData {
  return { ...mockStreakData };
}

/**
 * Récupère les milestones récents
 */
export function getRecentMilestones(): Milestone[] {
  return [...mockMilestones];
}

/**
 * Simule le déblocage d'un badge
 */
export function unlockBadge(badgeId: string): Badge | null {
  const badge = allBadges.find((b) => b.id === badgeId);
  if (badge && !badge.unlockedAt) {
    badge.unlockedAt = new Date();
    badge.progress = 100;
    return badge;
  }
  return null;
}

/**
 * Simule l'incrémentation du streak
 */
export function incrementStreak(): StreakData {
  mockStreakData.current += 1;
  mockStreakData.best = Math.max(mockStreakData.current, mockStreakData.best);
  mockStreakData.lastRecordedDate = new Date();
  mockStreakData.isActive = true;
  return { ...mockStreakData };
}

/**
 * Récupère le prochain badge à débloquer (le plus proche de 100%)
 */
export function getNextBadgeToUnlock(): Badge | null {
  const locked = allBadges
    .filter((b) => !b.unlockedAt && b.progress !== undefined)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0));
  return locked[0] || null;
}
