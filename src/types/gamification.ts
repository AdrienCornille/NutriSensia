/**
 * Types pour la Gamification & Motivation
 *
 * GAME-001: Streaks d'enregistrement
 * GAME-002: Badges de progression
 * GAME-003: Célébrations de milestones
 * GAME-004: Ton bienveillant sans culpabilisation
 */

// ==================== BADGE TYPES ====================

export type BadgeId =
  | 'first_meal'
  | 'streak_7'
  | 'streak_30'
  | 'hydration_7'
  | 'first_goal'
  | 'photo_10'
  | 'first_message'
  | 'early_bird'
  | 'variety_master'
  | 'consistency_king';

export type BadgeCategory =
  | 'streak'
  | 'nutrition'
  | 'hydration'
  | 'social'
  | 'milestone';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

// ==================== INTERFACES ====================

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  unlockedAt: Date | null;
  progress?: number; // 0-100 for badges with progress tracking
  maxProgress?: number;
}

export interface StreakData {
  current: number;
  best: number;
  lastRecordedDate: Date | null;
  isActive: boolean;
}

export interface Milestone {
  id: string;
  type: 'weight' | 'streak' | 'badge' | 'custom';
  title: string;
  description: string;
  achievedAt: Date;
  value?: number;
  badge?: Badge;
}

export interface GamificationStats {
  totalBadges: number;
  unlockedBadges: number;
  currentStreak: number;
  bestStreak: number;
  totalMealsLogged: number;
  totalPhotosUploaded: number;
}

// ==================== CELEBRATION ====================

export interface CelebrationData {
  type: 'badge_unlock' | 'milestone' | 'streak_milestone';
  title: string;
  message: string;
  icon?: string;
  badge?: Badge;
  confetti?: boolean;
}

// ==================== STATE ====================

export interface GamificationState {
  badges: Badge[];
  streak: StreakData;
  recentMilestones: Milestone[];
  pendingCelebration: CelebrationData | null;
  isLoading: boolean;
}

// ==================== ACTIONS ====================

export type GamificationAction =
  | { type: 'SET_BADGES'; badges: Badge[] }
  | { type: 'UNLOCK_BADGE'; badgeId: BadgeId; unlockedAt: Date }
  | { type: 'UPDATE_BADGE_PROGRESS'; badgeId: BadgeId; progress: number }
  | { type: 'SET_STREAK'; streak: StreakData }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'RESET_STREAK' }
  | { type: 'ADD_MILESTONE'; milestone: Milestone }
  | { type: 'SET_CELEBRATION'; celebration: CelebrationData | null }
  | { type: 'DISMISS_CELEBRATION' }
  | { type: 'SET_LOADING'; isLoading: boolean };

// ==================== INITIAL STATE ====================

export const initialGamificationState: GamificationState = {
  badges: [],
  streak: {
    current: 0,
    best: 0,
    lastRecordedDate: null,
    isActive: false,
  },
  recentMilestones: [],
  pendingCelebration: null,
  isLoading: true,
};

// ==================== REDUCER ====================

export function gamificationReducer(
  state: GamificationState,
  action: GamificationAction
): GamificationState {
  switch (action.type) {
    case 'SET_BADGES':
      return { ...state, badges: action.badges, isLoading: false };
    case 'UNLOCK_BADGE':
      return {
        ...state,
        badges: state.badges.map(b =>
          b.id === action.badgeId
            ? { ...b, unlockedAt: action.unlockedAt, progress: 100 }
            : b
        ),
      };
    case 'UPDATE_BADGE_PROGRESS':
      return {
        ...state,
        badges: state.badges.map(b =>
          b.id === action.badgeId ? { ...b, progress: action.progress } : b
        ),
      };
    case 'SET_STREAK':
      return { ...state, streak: action.streak };
    case 'INCREMENT_STREAK':
      const newCurrent = state.streak.current + 1;
      return {
        ...state,
        streak: {
          ...state.streak,
          current: newCurrent,
          best: Math.max(newCurrent, state.streak.best),
          lastRecordedDate: new Date(),
          isActive: true,
        },
      };
    case 'RESET_STREAK':
      return {
        ...state,
        streak: {
          ...state.streak,
          current: 0,
          lastRecordedDate: null,
          isActive: false,
        },
      };
    case 'ADD_MILESTONE':
      return {
        ...state,
        recentMilestones: [action.milestone, ...state.recentMilestones].slice(
          0,
          10
        ),
      };
    case 'SET_CELEBRATION':
      return { ...state, pendingCelebration: action.celebration };
    case 'DISMISS_CELEBRATION':
      return { ...state, pendingCelebration: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================

export const badgeCategoryConfig: Record<
  BadgeCategory,
  { label: string; color: string }
> = {
  streak: { label: 'Régularité', color: 'orange' },
  nutrition: { label: 'Nutrition', color: 'emerald' },
  hydration: { label: 'Hydratation', color: 'cyan' },
  social: { label: 'Social', color: 'purple' },
  milestone: { label: 'Objectifs', color: 'amber' },
};

export const badgeRarityConfig: Record<
  BadgeRarity,
  { label: string; bgColor: string; borderColor: string; textColor: string }
> = {
  common: {
    label: 'Commun',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-600',
  },
  rare: {
    label: 'Rare',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-600',
  },
  epic: {
    label: 'Épique',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-600',
  },
  legendary: {
    label: 'Légendaire',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-600',
  },
};

// ==================== HELPERS ====================

/**
 * Calcule le pourcentage de badges débloqués
 */
export function getUnlockedBadgesPercentage(badges: Badge[]): number {
  if (badges.length === 0) return 0;
  const unlocked = badges.filter(b => b.unlockedAt !== null).length;
  return Math.round((unlocked / badges.length) * 100);
}

/**
 * Filtre les badges par catégorie
 */
export function getBadgesByCategory(
  badges: Badge[],
  category: BadgeCategory
): Badge[] {
  return badges.filter(b => b.category === category);
}

/**
 * Récupère les badges débloqués
 */
export function getUnlockedBadges(badges: Badge[]): Badge[] {
  return badges.filter(b => b.unlockedAt !== null);
}

/**
 * Récupère les badges verrouillés
 */
export function getLockedBadges(badges: Badge[]): Badge[] {
  return badges.filter(b => b.unlockedAt === null);
}

/**
 * Vérifie si un streak milestone est atteint
 */
export function checkStreakMilestone(streak: number): number | null {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  return milestones.find(m => streak === m) || null;
}

/**
 * Génère un message d'encouragement bienveillant
 */
export function getEncouragementMessage(
  context: 'streak_broken' | 'goal_missed' | 'general'
): string {
  const messages = {
    streak_broken: [
      'Pas de souci, chaque jour est une nouvelle opportunité !',
      "L'important c'est de reprendre, pas d'être parfait.",
      'Les pauses font partie du voyage. On repart ensemble ?',
    ],
    goal_missed: [
      'Demain est un nouveau jour plein de possibilités !',
      "La progression n'est jamais linéaire, et c'est normal.",
      'Chaque effort compte, même les plus petits.',
    ],
    general: [
      'Vous faites du super travail !',
      'Continuez comme ça, vous êtes sur la bonne voie.',
      'Chaque pas compte dans votre parcours.',
    ],
  };

  const contextMessages = messages[context];
  return contextMessages[Math.floor(Math.random() * contextMessages.length)];
}

/**
 * Génère les statistiques de gamification
 */
export function getGamificationStats(
  badges: Badge[],
  streak: StreakData
): GamificationStats {
  return {
    totalBadges: badges.length,
    unlockedBadges: badges.filter(b => b.unlockedAt !== null).length,
    currentStreak: streak.current,
    bestStreak: streak.best,
    totalMealsLogged: 0, // À connecter avec les vraies données
    totalPhotosUploaded: 0, // À connecter avec les vraies données
  };
}
