/**
 * Système de suivi de complétude du profil
 *
 * Ce module fournit des fonctionnalités pour :
 * - Calculer le pourcentage de complétude d'un profil
 * - Identifier les champs manquants
 * - Fournir des recommandations d'amélioration
 * - Gérer les priorités des champs selon le rôle utilisateur
 */

import type { NutritionistProfile, PatientProfile } from '@/lib/database-types';

// Types pour les données de profil
export type UserRole = 'nutritionist' | 'patient';
export type ProfileData = NutritionistProfile | PatientProfile;

/**
 * Configuration des champs de profil avec leurs poids et priorités
 */
interface FieldConfig {
  /** Nom du champ */
  name: string;
  /** Poids du champ dans le calcul (1-10) */
  weight: number;
  /** Priorité pour l'onboarding */
  priority: 'critical' | 'important' | 'optional';
  /** Libellé affiché à l'utilisateur */
  label: string;
  /** Description pour guider l'utilisateur */
  description: string;
  /** Catégorie du champ */
  category: 'basic' | 'professional' | 'medical' | 'contact' | 'preferences';
}

/**
 * Configuration des champs communs à tous les utilisateurs
 */
const COMMON_FIELDS: FieldConfig[] = [
  {
    name: 'first_name',
    weight: 10,
    priority: 'critical',
    label: 'Prénom',
    description:
      'Votre prénom est nécessaire pour personnaliser votre expérience',
    category: 'basic',
  },
  {
    name: 'last_name',
    weight: 10,
    priority: 'critical',
    label: 'Nom',
    description: 'Votre nom de famille est requis pour votre identification',
    category: 'basic',
  },
  {
    name: 'phone',
    weight: 7,
    priority: 'important',
    label: 'Téléphone',
    description: 'Un numéro de téléphone facilite les communications urgentes',
    category: 'contact',
  },
  {
    name: 'avatar_url',
    weight: 3,
    priority: 'optional',
    label: 'Photo de profil',
    description: 'Une photo aide à créer un lien de confiance',
    category: 'basic',
  },
  {
    name: 'locale',
    weight: 5,
    priority: 'important',
    label: 'Langue',
    description: "Choisissez votre langue préférée pour l'interface",
    category: 'preferences',
  },
  {
    name: 'timezone',
    weight: 4,
    priority: 'important',
    label: 'Fuseau horaire',
    description: 'Nécessaire pour planifier vos rendez-vous',
    category: 'preferences',
  },
];

/**
 * Configuration des champs spécifiques aux nutritionnistes
 */
const NUTRITIONIST_FIELDS: FieldConfig[] = [
  {
    name: 'asca_number',
    weight: 8,
    priority: 'important',
    label: 'Numéro ASCA',
    description: 'Votre numéro ASCA valide votre certification professionnelle',
    category: 'professional',
  },
  {
    name: 'rme_number',
    weight: 8,
    priority: 'important',
    label: 'Numéro RME',
    description: "Votre numéro RME pour les remboursements d'assurance",
    category: 'professional',
  },
  {
    name: 'ean_code',
    weight: 6,
    priority: 'optional',
    label: 'Code EAN',
    description: "Code d'identification pour la facturation électronique",
    category: 'professional',
  },
  {
    name: 'specializations',
    weight: 9,
    priority: 'critical',
    label: 'Spécialisations',
    description: "Vos domaines d'expertise aident les patients à vous trouver",
    category: 'professional',
  },
  {
    name: 'bio',
    weight: 7,
    priority: 'important',
    label: 'Biographie professionnelle',
    description: 'Présentez-vous à vos futurs patients',
    category: 'professional',
  },
  {
    name: 'consultation_rates',
    weight: 8,
    priority: 'important',
    label: 'Tarifs de consultation',
    description: 'Informez vos patients de vos tarifs',
    category: 'professional',
  },
  {
    name: 'practice_address',
    weight: 9,
    priority: 'critical',
    label: 'Adresse du cabinet',
    description: 'Nécessaire pour que les patients puissent vous trouver',
    category: 'contact',
  },
];

/**
 * Configuration des champs spécifiques aux patients
 */
const PATIENT_FIELDS: FieldConfig[] = [
  {
    name: 'date_of_birth',
    weight: 8,
    priority: 'important',
    label: 'Date de naissance',
    description: 'Nécessaire pour calculer vos besoins nutritionnels',
    category: 'basic',
  },
  {
    name: 'gender',
    weight: 6,
    priority: 'important',
    label: 'Sexe',
    description: 'Influence les recommandations nutritionnelles',
    category: 'basic',
  },
  {
    name: 'height',
    weight: 9,
    priority: 'critical',
    label: 'Taille',
    description: 'Essentielle pour calculer vos besoins caloriques',
    category: 'medical',
  },
  {
    name: 'initial_weight',
    weight: 9,
    priority: 'critical',
    label: 'Poids initial',
    description: 'Point de départ pour votre suivi nutritionnel',
    category: 'medical',
  },
  {
    name: 'target_weight',
    weight: 8,
    priority: 'important',
    label: 'Poids cible',
    description: 'Votre objectif de poids à atteindre',
    category: 'medical',
  },
  {
    name: 'activity_level',
    weight: 7,
    priority: 'important',
    label: "Niveau d'activité",
    description: 'Influence vos besoins énergétiques quotidiens',
    category: 'medical',
  },
  {
    name: 'allergies',
    weight: 10,
    priority: 'critical',
    label: 'Allergies',
    description: 'Cruciales pour votre sécurité alimentaire',
    category: 'medical',
  },
  {
    name: 'dietary_restrictions',
    weight: 8,
    priority: 'important',
    label: 'Restrictions alimentaires',
    description: 'Vos préférences et contraintes alimentaires',
    category: 'preferences',
  },
  {
    name: 'medical_conditions',
    weight: 9,
    priority: 'critical',
    label: 'Conditions médicales',
    description: 'Informations médicales importantes pour votre suivi',
    category: 'medical',
  },
  {
    name: 'medications',
    weight: 8,
    priority: 'important',
    label: 'Médicaments',
    description: 'Peuvent interagir avec certains aliments',
    category: 'medical',
  },
  {
    name: 'emergency_contact',
    weight: 6,
    priority: 'important',
    label: "Contact d'urgence",
    description: "Important en cas d'urgence médicale",
    category: 'contact',
  },
];

/**
 * Résultat du calcul de complétude
 */
export interface ProfileCompletion {
  /** Pourcentage de complétude global (0-100) */
  percentage: number;
  /** Pourcentage par catégorie */
  categoryBreakdown: {
    basic: number;
    professional: number;
    medical: number;
    contact: number;
    preferences: number;
  };
  /** Champs manquants par priorité */
  missingFields: {
    critical: FieldConfig[];
    important: FieldConfig[];
    optional: FieldConfig[];
  };
  /** Recommandations personnalisées */
  recommendations: string[];
  /** Prochaine étape suggérée */
  nextStep: FieldConfig | null;
  /** Niveau de complétude */
  level: 'incomplete' | 'basic' | 'good' | 'excellent';
}

/**
 * Vérifie si un champ est rempli
 */
function isFieldFilled(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Obtient la configuration des champs pour un rôle donné
 */
function getFieldsConfig(role: UserRole): FieldConfig[] {
  const commonFields = [...COMMON_FIELDS];
  const roleSpecificFields =
    role === 'nutritionist' ? NUTRITIONIST_FIELDS : PATIENT_FIELDS;
  return [...commonFields, ...roleSpecificFields];
}

/**
 * Calcule le pourcentage de complétude d'un profil
 */
export function calculateProfileCompletion(
  profileData: Partial<ProfileData>,
  role: UserRole
): ProfileCompletion {
  const fieldsConfig = getFieldsConfig(role);
  const totalWeight = fieldsConfig.reduce(
    (sum, field) => sum + field.weight,
    0
  );

  let completedWeight = 0;
  const missingFields: {
    critical: FieldConfig[];
    important: FieldConfig[];
    optional: FieldConfig[];
  } = {
    critical: [],
    important: [],
    optional: [],
  };

  // Calcul par catégorie
  const categoryStats: Record<string, { completed: number; total: number }> = {
    basic: { completed: 0, total: 0 },
    professional: { completed: 0, total: 0 },
    medical: { completed: 0, total: 0 },
    contact: { completed: 0, total: 0 },
    preferences: { completed: 0, total: 0 },
  };

  // Analyser chaque champ
  fieldsConfig.forEach(field => {
    const value = (profileData as any)[field.name];
    const isFilled = isFieldFilled(value);

    // Mettre à jour les statistiques par catégorie
    categoryStats[field.category].total += field.weight;
    if (isFilled) {
      completedWeight += field.weight;
      categoryStats[field.category].completed += field.weight;
    } else {
      missingFields[field.priority].push(field);
    }
  });

  // Calculer les pourcentages par catégorie
  const categoryBreakdown = {
    basic:
      categoryStats.basic.total > 0
        ? Math.round(
            (categoryStats.basic.completed / categoryStats.basic.total) * 100
          )
        : 100,
    professional:
      categoryStats.professional.total > 0
        ? Math.round(
            (categoryStats.professional.completed /
              categoryStats.professional.total) *
              100
          )
        : 100,
    medical:
      categoryStats.medical.total > 0
        ? Math.round(
            (categoryStats.medical.completed / categoryStats.medical.total) *
              100
          )
        : 100,
    contact:
      categoryStats.contact.total > 0
        ? Math.round(
            (categoryStats.contact.completed / categoryStats.contact.total) *
              100
          )
        : 100,
    preferences:
      categoryStats.preferences.total > 0
        ? Math.round(
            (categoryStats.preferences.completed /
              categoryStats.preferences.total) *
              100
          )
        : 100,
  };

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  // Déterminer le niveau de complétude
  let level: 'incomplete' | 'basic' | 'good' | 'excellent';
  if (percentage < 40) level = 'incomplete';
  else if (percentage < 70) level = 'basic';
  else if (percentage < 90) level = 'good';
  else level = 'excellent';

  // Générer des recommandations
  const recommendations = generateRecommendations(
    missingFields,
    role,
    percentage
  );

  // Déterminer la prochaine étape
  const nextStep = getNextStep(missingFields);

  return {
    percentage,
    categoryBreakdown,
    missingFields,
    recommendations,
    nextStep,
    level,
  };
}

/**
 * Génère des recommandations personnalisées
 */
function generateRecommendations(
  missingFields: ProfileCompletion['missingFields'],
  role: UserRole,
  percentage: number
): string[] {
  const recommendations: string[] = [];

  if (missingFields.critical.length > 0) {
    recommendations.push(
      `Complétez les ${missingFields.critical.length} champ(s) critique(s) manquant(s) pour améliorer votre profil.`
    );
  }

  if (percentage < 50) {
    if (role === 'nutritionist') {
      recommendations.push(
        "Un profil complet augmente vos chances d'être trouvé par des patients."
      );
    } else {
      recommendations.push(
        'Un profil complet permet à votre nutritionniste de mieux vous accompagner.'
      );
    }
  }

  if (missingFields.important.length > 0 && percentage > 50) {
    recommendations.push(
      `Ajoutez ${missingFields.important.length} information(s) importante(s) pour optimiser votre profil.`
    );
  }

  if (percentage > 80 && missingFields.optional.length > 0) {
    recommendations.push(
      'Excellent travail ! Vous pouvez encore améliorer votre profil avec quelques détails supplémentaires.'
    );
  }

  return recommendations;
}

/**
 * Détermine la prochaine étape suggérée
 */
function getNextStep(
  missingFields: ProfileCompletion['missingFields']
): FieldConfig | null {
  // Prioriser les champs critiques
  if (missingFields.critical.length > 0) {
    return missingFields.critical[0];
  }

  // Puis les champs importants
  if (missingFields.important.length > 0) {
    return missingFields.important[0];
  }

  // Enfin les champs optionnels
  if (missingFields.optional.length > 0) {
    return missingFields.optional[0];
  }

  return null;
}

/**
 * Obtient les champs requis pour un niveau de complétude donné
 */
export function getRequiredFieldsForLevel(
  role: UserRole,
  targetLevel: 'basic' | 'good' | 'excellent'
): FieldConfig[] {
  const fieldsConfig = getFieldsConfig(role);

  switch (targetLevel) {
    case 'basic':
      return fieldsConfig.filter(field => field.priority === 'critical');
    case 'good':
      return fieldsConfig.filter(
        field => field.priority === 'critical' || field.priority === 'important'
      );
    case 'excellent':
      return fieldsConfig;
    default:
      return [];
  }
}

/**
 * Estime le temps nécessaire pour compléter le profil
 */
export function estimateCompletionTime(
  missingFields: ProfileCompletion['missingFields']
): number {
  // Estimation en minutes
  const criticalTime = missingFields.critical.length * 3; // 3 min par champ critique
  const importantTime = missingFields.important.length * 2; // 2 min par champ important
  const optionalTime = missingFields.optional.length * 1; // 1 min par champ optionnel

  return criticalTime + importantTime + optionalTime;
}
