/**
 * Types pour la page Mon Dossier (Patient File)
 *
 * FILE-001: Consultation de l'anamnèse
 * FILE-002: Signalement de changement
 * FILE-003: Consultation des questionnaires de suivi
 * FILE-004: Gestion des documents
 * FILE-005: Historique des consultations
 * FILE-006: Suivi des objectifs
 * FILE-007: Export du dossier complet
 */

// ==================== ENUMS ====================

export type DossierTab =
  | 'anamnese'
  | 'profil'
  | 'questionnaires'
  | 'documents'
  | 'consultations'
  | 'objectifs';

export type AnamneseSectionId =
  | 'identite'
  | 'morphologie'
  | 'historique'
  | 'sante'
  | 'sante_bilan'
  | 'habitudes'
  | 'consommation'
  | 'lifestyle'
  | 'motivation'
  | 'psycho_comportemental';

export type QuestionnaireStatus = 'completed' | 'pending';

export type QuestionnaireType = 'Anamnèse' | 'Suivi' | 'Feedback';

export type DocumentType = 'pdf' | 'image';

export type DocumentCategory = 'Analyses' | 'Plans' | 'Ressources' | 'Autre';

export type DocumentUploader = 'patient' | 'nutritionist';

export type ConsultationMode = 'Cabinet' | 'Visio';

export type ObjectiveStatus = 'on-track' | 'in-progress' | 'needs-attention';

export type ObjectiveCategory = 'Poids' | 'Habitude' | 'Comportement';

// ==================== ANAMNESE INTERFACES ====================

export interface AnamneseField {
  label: string;
  value: string;
  /** Value before the last patient change report was integrated */
  previous_value?: string;
  /** ISO date – set when a patient change report is integrated */
  updated_at?: string;
  /** Origin of the last modification */
  updated_by?: 'patient_report' | 'nutritionist';
}

export interface AnamneseSection {
  id: AnamneseSectionId;
  label: string;
  icon: string;
  fields: AnamneseField[];
}

export interface AnamneseData {
  createdAt: string;
  updatedAt: string | null;
  nutritionist: string;
  sections: AnamneseSection[];
}

// ==================== QUESTIONNAIRE INTERFACES ====================

export interface Questionnaire {
  id: string;
  title: string;
  type: QuestionnaireType;
  date: string | null;
  status: QuestionnaireStatus;
  consultationLinked: string | null;
}

// ==================== DOCUMENT INTERFACES ====================

export interface PatientDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  uploadedAt: string;
  uploadedBy: DocumentUploader;
  category: DocumentCategory;
}

// ==================== CONSULTATION INTERFACES ====================

export interface Consultation {
  id: string;
  date: string;
  type: string;
  duration: string;
  mode: ConsultationMode;
  summary: string;
  keyPoints: string[];
  nextSteps: string;
}

// ==================== OBJECTIVE INTERFACES ====================

export interface Objective {
  id: string;
  title: string;
  category: ObjectiveCategory;
  target: string;
  current: string;
  startValue: string;
  progress: number;
  deadline: string | null;
  status: ObjectiveStatus;
}

// ==================== STATE ====================

export interface DossierState {
  activeTab: DossierTab;
  expandedSection: AnamneseSectionId | null;
  showDocumentModal: boolean;
  selectedDocument: PatientDocument | null;
  documentFilter: DocumentCategory | 'all';
}

// ==================== ACTIONS ====================

export type DossierAction =
  | { type: 'SET_TAB'; tab: DossierTab }
  | { type: 'TOGGLE_SECTION'; section: AnamneseSectionId }
  | { type: 'OPEN_DOCUMENT_MODAL'; document: PatientDocument }
  | { type: 'CLOSE_DOCUMENT_MODAL' }
  | { type: 'SET_DOCUMENT_FILTER'; filter: DocumentCategory | 'all' };

// ==================== INITIAL STATE ====================

export const initialDossierState: DossierState = {
  activeTab: 'anamnese',
  expandedSection: 'habitudes',
  showDocumentModal: false,
  selectedDocument: null,
  documentFilter: 'all',
};

// ==================== REDUCER ====================

export function dossierReducer(
  state: DossierState,
  action: DossierAction
): DossierState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'TOGGLE_SECTION':
      return {
        ...state,
        expandedSection:
          state.expandedSection === action.section ? null : action.section,
      };
    case 'OPEN_DOCUMENT_MODAL':
      return {
        ...state,
        showDocumentModal: true,
        selectedDocument: action.document,
      };
    case 'CLOSE_DOCUMENT_MODAL':
      return { ...state, showDocumentModal: false, selectedDocument: null };
    case 'SET_DOCUMENT_FILTER':
      return { ...state, documentFilter: action.filter };
    default:
      return state;
  }
}

// ==================== SECTION LABELS ====================

export const ANAMNESE_SECTION_LABELS: Record<AnamneseSectionId, string> = {
  identite: 'Identité & Coordonnées',
  morphologie: 'Données morphologiques',
  historique: 'Historique pondéral',
  sante: 'Antécédents & Traitements',
  sante_bilan: 'Bilan digestif & biologique',
  habitudes: 'Habitudes alimentaires',
  consommation: 'Consommation & Boissons',
  lifestyle: 'Mode de vie',
  motivation: 'Motivation & Objectifs',
  psycho_comportemental: 'Psycho-comportemental',
};

// ==================== CONFIGURATIONS ====================

export const dossierTabsConfig: {
  id: DossierTab;
  label: string;
  icon: string;
}[] = [
  { id: 'anamnese', label: 'Anamnèse', icon: '📋' },
  { id: 'questionnaires', label: 'Questionnaires', icon: '📝' },
  { id: 'documents', label: 'Documents', icon: '📁' },
  { id: 'consultations', label: 'Consultations', icon: '🗓' },
  { id: 'objectifs', label: 'Objectifs', icon: '🎯' },
];

export const statusConfig: Record<
  ObjectiveStatus | QuestionnaireStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  'on-track': {
    label: 'En bonne voie',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  'in-progress': {
    label: 'En cours',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  'needs-attention': {
    label: 'À améliorer',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  completed: {
    label: 'Complété',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  pending: {
    label: 'En attente',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

export const objectiveCategoryConfig: Record<
  ObjectiveCategory,
  { icon: string; bgColor: string }
> = {
  Poids: { icon: '⚖️', bgColor: 'bg-blue-100' },
  Habitude: { icon: '🔄', bgColor: 'bg-emerald-100' },
  Comportement: { icon: '🧠', bgColor: 'bg-purple-100' },
};

export const consultationModeConfig: Record<
  ConsultationMode,
  { bgColor: string; textColor: string }
> = {
  Cabinet: { bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  Visio: { bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
};

export const documentUploaderConfig: Record<
  DocumentUploader,
  { label: string; bgColor: string; textColor: string }
> = {
  nutritionist: {
    label: 'Nutritionniste',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  patient: {
    label: 'Vous',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
};

// ==================== HELPERS ====================

/**
 * Calcule la progression globale basée sur les objectifs
 */
export function calculateGlobalProgress(objectives: Objective[]): number {
  if (objectives.length === 0) return 0;
  const totalProgress = objectives.reduce((acc, obj) => acc + obj.progress, 0);
  return Math.round(totalProgress / objectives.length);
}

/**
 * Retourne la configuration de status pour un badge
 */
export function getStatusBadgeConfig(
  status: ObjectiveStatus | QuestionnaireStatus
) {
  return statusConfig[status];
}

/**
 * Filtre les documents par catégorie
 */
export function filterDocumentsByCategory(
  documents: PatientDocument[],
  filter: DocumentCategory | 'all'
): PatientDocument[] {
  if (filter === 'all') return documents;
  return documents.filter(doc => doc.category === filter);
}
