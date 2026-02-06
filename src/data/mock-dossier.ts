/**
 * Mock data pour la page Mon Dossier (Patient File)
 */

import type {
  AnamneseData,
  AnamneseSection,
  Questionnaire,
  PatientDocument,
  Consultation,
  Objective,
} from '@/types/dossier';

// ==================== ANAMNESE DATA ====================

const anamneseSections: AnamneseSection[] = [
  {
    id: 'identite',
    label: 'Identité & Contact',
    icon: '👤',
    fields: [
      { label: 'Nom complet', value: 'Jean Dupont' },
      { label: 'Date de naissance', value: '12 mars 1988 (37 ans)' },
      { label: 'Sexe', value: 'Masculin' },
      { label: 'Profession', value: 'Ingénieur informatique' },
      { label: 'Situation familiale', value: 'Marié, 2 enfants' },
    ],
  },
  {
    id: 'morphologie',
    label: 'Données morphologiques',
    icon: '📏',
    fields: [
      { label: 'Taille', value: '178 cm' },
      { label: 'Poids initial', value: '82.0 kg' },
      { label: 'IMC initial', value: '25.9 (Surpoids léger)' },
      { label: 'Tour de taille initial', value: '89 cm' },
      { label: 'Masse grasse estimée', value: '24%' },
    ],
  },
  {
    id: 'historique',
    label: 'Historique pondéral',
    icon: '📊',
    fields: [
      { label: 'Poids minimum adulte', value: '72 kg (2015)' },
      { label: 'Poids maximum adulte', value: '85 kg (2023)' },
      {
        label: 'Variations notables',
        value: 'Prise de 8 kg après naissance du 2e enfant',
      },
      {
        label: 'Régimes antérieurs',
        value: 'Régime Dukan (2019) - abandonné après 2 mois, effet yoyo',
      },
    ],
  },
  {
    id: 'sante',
    label: 'Antécédents médicaux',
    icon: '🏥',
    fields: [
      { label: 'Pathologies', value: 'Aucune pathologie chronique déclarée' },
      { label: 'Allergies alimentaires', value: 'Aucune' },
      { label: 'Intolérances', value: 'Légère intolérance au lactose' },
      { label: 'Traitements en cours', value: 'Aucun' },
      {
        label: 'Compléments alimentaires',
        value: 'Vitamine D (octobre à mars)',
      },
      {
        label: 'Antécédents familiaux',
        value: 'Diabète type 2 (père), Hypertension (mère)',
      },
    ],
  },
  {
    id: 'habitudes',
    label: 'Habitudes alimentaires',
    icon: '🍽',
    fields: [
      { label: 'Nombre de repas/jour', value: '3 repas + 1 collation' },
      {
        label: 'Petit-déjeuner type',
        value: 'Café + tartines beurre/confiture, parfois sauté',
      },
      { label: 'Déjeuner type', value: 'Cantine entreprise, choix variable' },
      { label: 'Dîner type', value: 'Repas familial, cuisine maison' },
      { label: 'Grignotage', value: 'Fréquent en soirée (biscuits, fromage)' },
      { label: "Consommation d'alcool", value: '2-3 verres de vin/semaine' },
      { label: 'Hydratation', value: 'Insuffisante (~1L/jour)' },
      { label: 'Aliments détestés', value: 'Choux de Bruxelles, abats' },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Mode de vie',
    icon: '🏃',
    fields: [
      { label: 'Activité professionnelle', value: 'Sédentaire (bureau)' },
      {
        label: 'Activité physique',
        value: 'Course à pied 1x/semaine, irrégulier',
      },
      { label: "Temps d'écran", value: '8-10h/jour (travail + loisirs)' },
      {
        label: 'Qualité du sommeil',
        value: 'Moyenne, coucher tardif (~23h30)',
      },
      {
        label: 'Niveau de stress',
        value: 'Modéré à élevé (charge de travail)',
      },
      { label: 'Tabac', value: 'Non-fumeur' },
    ],
  },
  {
    id: 'motivation',
    label: 'Motivation & Objectifs',
    icon: '💪',
    fields: [
      {
        label: 'Raison de consultation',
        value: "Perte de poids, améliorer l'énergie au quotidien",
      },
      { label: 'Objectif pondéral', value: 'Atteindre 75 kg' },
      {
        label: 'Motivation principale',
        value: 'Être en meilleure forme pour jouer avec ses enfants',
      },
      {
        label: 'Freins identifiés',
        value: 'Manque de temps, grignotage émotionnel le soir',
      },
      {
        label: 'Soutien entourage',
        value: 'Épouse motivée à adapter les repas familiaux',
      },
    ],
  },
];

export function getAnamneseData(): AnamneseData {
  return {
    createdAt: '15 décembre 2025',
    updatedAt: null,
    nutritionist: 'Lucie Martin',
    sections: anamneseSections,
  };
}

// ==================== QUESTIONNAIRES DATA ====================

const questionnaires: Questionnaire[] = [
  {
    id: 'q1',
    title: 'Questionnaire initial',
    type: 'Anamnèse',
    date: '15 décembre 2025',
    status: 'completed',
    consultationLinked: 'Première consultation',
  },
  {
    id: 'q2',
    title: 'Bilan 1 mois',
    type: 'Suivi',
    date: '15 janvier 2026',
    status: 'completed',
    consultationLinked: 'Consultation de suivi #1',
  },
  {
    id: 'q3',
    title: 'Questionnaire satisfaction',
    type: 'Feedback',
    date: null,
    status: 'pending',
    consultationLinked: null,
  },
];

export function getQuestionnairesData(): Questionnaire[] {
  return questionnaires;
}

// ==================== DOCUMENTS DATA ====================

const documents: PatientDocument[] = [
  {
    id: 'd1',
    name: 'Analyse sanguine - Décembre 2025',
    type: 'pdf',
    size: '245 Ko',
    uploadedAt: '14 décembre 2025',
    uploadedBy: 'patient',
    category: 'Analyses',
  },
  {
    id: 'd2',
    name: 'Plan alimentaire - Semaine 1-4',
    type: 'pdf',
    size: '180 Ko',
    uploadedAt: '15 décembre 2025',
    uploadedBy: 'nutritionist',
    category: 'Plans',
  },
  {
    id: 'd3',
    name: 'Guide des portions',
    type: 'pdf',
    size: '1.2 Mo',
    uploadedAt: '15 décembre 2025',
    uploadedBy: 'nutritionist',
    category: 'Ressources',
  },
  {
    id: 'd4',
    name: 'Analyse sanguine - Janvier 2026',
    type: 'pdf',
    size: '252 Ko',
    uploadedAt: '10 janvier 2026',
    uploadedBy: 'patient',
    category: 'Analyses',
  },
];

export function getDocumentsData(): PatientDocument[] {
  return documents;
}

// ==================== CONSULTATIONS DATA ====================

const consultations: Consultation[] = [
  {
    id: 'c1',
    date: '15 décembre 2025',
    type: 'Première consultation',
    duration: '60 min',
    mode: 'Cabinet',
    summary:
      'Prise de connaissance, anamnèse complète, définition des objectifs. Mise en place du premier plan alimentaire.',
    keyPoints: [
      'Objectif: -7 kg sur 6 mois',
      'Priorité: réduire le grignotage du soir',
      "Augmenter l'hydratation à 2L/jour",
      'Introduire un petit-déjeuner protéiné',
    ],
    nextSteps: "Suivi dans 1 mois pour évaluer l'adhérence au plan",
  },
  {
    id: 'c2',
    date: '15 janvier 2026',
    type: 'Consultation de suivi',
    duration: '30 min',
    mode: 'Visio',
    summary:
      'Bon démarrage, perte de 1.6 kg. Grignotage réduit mais pas éliminé. Hydratation en amélioration.',
    keyPoints: [
      'Poids: 80.4 kg (-1.6 kg)',
      'Petit-déjeuner bien intégré',
      'Grignotage réduit à 3x/semaine',
      'Sommeil légèrement amélioré',
    ],
    nextSteps: "Continuer le plan actuel, focus sur l'activité physique",
  },
];

export function getConsultationsData(): Consultation[] {
  return consultations;
}

// ==================== OBJECTIVES DATA ====================

const objectives: Objective[] = [
  {
    id: 'obj1',
    title: 'Atteindre 75 kg',
    category: 'Poids',
    target: '75 kg',
    current: '78.4 kg',
    startValue: '82.0 kg',
    progress: 51,
    deadline: '15 juin 2026',
    status: 'on-track',
  },
  {
    id: 'obj2',
    title: 'Hydratation quotidienne',
    category: 'Habitude',
    target: '2L / jour',
    current: '1.8L en moyenne',
    startValue: '1L / jour',
    progress: 80,
    deadline: null,
    status: 'on-track',
  },
  {
    id: 'obj3',
    title: 'Éliminer le grignotage du soir',
    category: 'Comportement',
    target: '0x / semaine',
    current: '3x / semaine',
    startValue: '5-6x / semaine',
    progress: 50,
    deadline: null,
    status: 'in-progress',
  },
  {
    id: 'obj4',
    title: 'Activité physique régulière',
    category: 'Habitude',
    target: '3 séances / semaine',
    current: '1-2 séances / semaine',
    startValue: '1 séance / semaine',
    progress: 40,
    deadline: null,
    status: 'needs-attention',
  },
];

export function getObjectivesData(): Objective[] {
  return objectives;
}

// ==================== DOCUMENT CATEGORIES ====================

export const documentCategories = [
  'Toutes les catégories',
  'Analyses',
  'Plans',
  'Ressources',
  'Autre',
] as const;
