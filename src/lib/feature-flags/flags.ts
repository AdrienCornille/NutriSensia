/**
 * Feature Flags pour les tests A/B de l'onboarding
 *
 * Ce fichier définit tous les feature flags utilisés pour les tests A/B
 * sur les différents parcours d'onboarding des utilisateurs.
 */

import { flag } from 'flags/next';

/**
 * Feature flag pour tester différentes variantes du parcours d'onboarding nutritionniste
 *
 * Variantes possibles :
 * - "control" : Parcours d'onboarding standard actuel
 * - "simplified" : Version simplifiée avec moins d'étapes
 * - "gamified" : Version avec éléments de gamification
 * - "guided" : Version avec plus d'aide contextuelle
 */
export const nutritionistOnboardingVariant = flag<
  'control' | 'simplified' | 'gamified' | 'guided'
>({
  key: 'nutritionist-onboarding-variant',
  description:
    "Test A/B pour optimiser le parcours d'onboarding des nutritionnistes",
  defaultValue: 'control',
  // Fonction pour déterminer quelle variante afficher
  decide: async context => {
    // Récupération de l'ID utilisateur pour une attribution consistente
    const userId = context.get('userId') as string;
    const userRole = context.get('userRole') as string;

    // Ne s'applique qu'aux nutritionnistes
    if (userRole !== 'nutritionist') {
      return 'control';
    }

    // Attribution basée sur un hash de l'ID utilisateur pour la consistance
    const hash = await hashString(userId || 'anonymous');
    const hashValue = hash % 100;

    // Distribution des variantes (25% chacune)
    if (hashValue < 25) return 'control';
    if (hashValue < 50) return 'simplified';
    if (hashValue < 75) return 'gamified';
    return 'guided';
  },
});

/**
 * Feature flag pour tester différentes variantes du parcours d'onboarding patient
 */
export const patientOnboardingVariant = flag<
  'control' | 'express' | 'detailed' | 'personalized'
>({
  key: 'patient-onboarding-variant',
  description: "Test A/B pour optimiser le parcours d'onboarding des patients",
  defaultValue: 'control',
  decide: async context => {
    const userId = context.get('userId') as string;
    const userRole = context.get('userRole') as string;

    if (userRole !== 'patient') {
      return 'control';
    }

    const hash = await hashString(userId || 'anonymous');
    const hashValue = hash % 100;

    if (hashValue < 25) return 'control';
    if (hashValue < 50) return 'express';
    if (hashValue < 75) return 'detailed';
    return 'personalized';
  },
});

/**
 * Feature flag pour tester l'affichage du progrès d'onboarding
 */
export const onboardingProgressDisplay = flag<
  'linear' | 'circular' | 'steps' | 'minimal'
>({
  key: 'onboarding-progress-display',
  description: "Test A/B pour l'affichage du progrès d'onboarding",
  defaultValue: 'linear',
  decide: async context => {
    const userId = context.get('userId') as string;
    const hash = await hashString(userId || 'anonymous');
    const hashValue = hash % 100;

    if (hashValue < 25) return 'linear';
    if (hashValue < 50) return 'circular';
    if (hashValue < 75) return 'steps';
    return 'minimal';
  },
});

/**
 * Feature flag pour tester différents types de validation de formulaire
 */
export const formValidationType = flag<
  'realtime' | 'onblur' | 'onsubmit' | 'progressive'
>({
  key: 'form-validation-type',
  description:
    "Test A/B pour le type de validation des formulaires d'onboarding",
  defaultValue: 'realtime',
  decide: async context => {
    const userId = context.get('userId') as string;
    const hash = await hashString(userId || 'anonymous');
    const hashValue = hash % 100;

    if (hashValue < 25) return 'realtime';
    if (hashValue < 50) return 'onblur';
    if (hashValue < 75) return 'onsubmit';
    return 'progressive';
  },
});

/**
 * Feature flag pour tester l'activation des animations d'onboarding
 */
export const onboardingAnimations = flag<boolean>({
  key: 'onboarding-animations',
  description: "Test A/B pour l'impact des animations sur l'engagement",
  defaultValue: true,
  decide: async context => {
    const userId = context.get('userId') as string;
    const hash = await hashString(userId || 'anonymous');

    // 50/50 split
    return hash % 2 === 0;
  },
});

/**
 * Feature flag pour tester différents messages de motivation
 */
export const motivationMessages = flag<
  'encouraging' | 'informative' | 'minimal' | 'gamified'
>({
  key: 'motivation-messages',
  description: "Test A/B pour les messages de motivation pendant l'onboarding",
  defaultValue: 'encouraging',
  decide: async context => {
    const userId = context.get('userId') as string;
    const hash = await hashString(userId || 'anonymous');
    const hashValue = hash % 100;

    if (hashValue < 25) return 'encouraging';
    if (hashValue < 50) return 'informative';
    if (hashValue < 75) return 'minimal';
    return 'gamified';
  },
});

/**
 * Feature flag pour tester l'ordre des étapes d'onboarding
 */
export const onboardingStepOrder = flag<
  'standard' | 'profile-first' | 'goals-first' | 'adaptive'
>({
  key: 'onboarding-step-order',
  description: "Test A/B pour l'ordre optimal des étapes d'onboarding",
  defaultValue: 'standard',
  decide: async context => {
    const userId = context.get('userId') as string;
    const userRole = context.get('userRole') as string;
    const hash = await hashString(userId || 'anonymous');
    const hashValue = hash % 100;

    // Différents ordres selon le rôle
    if (userRole === 'nutritionist') {
      if (hashValue < 25) return 'standard';
      if (hashValue < 50) return 'profile-first';
      if (hashValue < 75) return 'goals-first';
      return 'adaptive';
    }

    // Pour les patients, logique similaire mais adaptée
    if (hashValue < 25) return 'standard';
    if (hashValue < 50) return 'profile-first';
    if (hashValue < 75) return 'goals-first';
    return 'adaptive';
  },
});

// Liste des flags pour la pré-computation (pour les performances)
export const precomputeFlags = [
  nutritionistOnboardingVariant,
  patientOnboardingVariant,
  onboardingProgressDisplay,
  formValidationType,
  onboardingAnimations,
  motivationMessages,
  onboardingStepOrder,
];

/**
 * Fonction utilitaire pour créer un hash consistant à partir d'une chaîne
 */
async function hashString(str: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);

  // Convertir les premiers 4 bytes en nombre
  let hash = 0;
  for (let i = 0; i < 4; i++) {
    hash = (hash << 8) | hashArray[i];
  }

  return Math.abs(hash);
}

/**
 * Type helper pour extraire les types de variantes des flags
 */
export type NutritionistOnboardingVariant = Awaited<
  ReturnType<typeof nutritionistOnboardingVariant>
>;
export type PatientOnboardingVariant = Awaited<
  ReturnType<typeof patientOnboardingVariant>
>;
export type OnboardingProgressDisplay = Awaited<
  ReturnType<typeof onboardingProgressDisplay>
>;
export type FormValidationType = Awaited<ReturnType<typeof formValidationType>>;
export type MotivationMessages = Awaited<ReturnType<typeof motivationMessages>>;
export type OnboardingStepOrder = Awaited<
  ReturnType<typeof onboardingStepOrder>
>;
