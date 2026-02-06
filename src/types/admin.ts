/**
 * Types pour le panel admin
 * @see AUTH-010 dans USER_STORIES.md
 */

import type {
  NutritionistStatus,
  NutritionistDocument,
} from './nutritionist-registration';

// ==================== NUTRITIONNISTE (VUE ADMIN) ====================

export interface AdminNutritionistProfile {
  id: string;
  userId: string;

  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Informations professionnelles
  ascaNumber?: string;
  rmeNumber?: string;
  specializations: string[];
  yearsOfExperience?: string;
  languages: string[];
  bio?: string;
  cabinetAddress?: {
    street?: string;
    postalCode?: string;
    city?: string;
    canton?: string;
  };

  // Status et validation
  status: NutritionistStatus;
  rejectionReason?: string;
  infoRequestMessage?: string;
  infoResponse?: string;
  infoRespondedAt?: Date;
  validatedAt?: Date;
  validatedBy?: string;

  // Documents
  documents: NutritionistDocument[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==================== FILTRES ET PAGINATION ====================

export interface AdminNutritionistFilters {
  status?: NutritionistStatus | 'all';
  search?: string;
}

export interface AdminNutritionistListResponse {
  nutritionists: AdminNutritionistProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== ACTIONS ADMIN ====================

export interface ValidateNutritionistRequest {
  nutritionistId: string;
  action: 'approve' | 'reject' | 'request_info';
  reason?: string; // Required for reject and request_info
}

export interface ValidateNutritionistResponse {
  success: boolean;
  message: string;
  nutritionist?: AdminNutritionistProfile;
}

// ==================== STATUS CONFIG ====================

export const NUTRITIONIST_STATUS_CONFIG: Record<
  NutritionistStatus,
  {
    label: string;
    labelFr: string;
    color: string;
    bgColor: string;
    textColor: string;
    description: string;
  }
> = {
  pending: {
    label: 'Pending',
    labelFr: 'En attente',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    description: 'Demande en attente de validation',
  },
  active: {
    label: 'Active',
    labelFr: 'Actif',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    description: 'Nutritionniste validé et actif',
  },
  rejected: {
    label: 'Rejected',
    labelFr: 'Rejeté',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    description: 'Demande rejetée',
  },
  info_required: {
    label: 'Info Required',
    labelFr: 'Info requise',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    description: 'Informations complémentaires demandées',
  },
  suspended: {
    label: 'Suspended',
    labelFr: 'Suspendu',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    description: 'Compte suspendu',
  },
};

// ==================== HELPERS ====================

export function getStatusBadgeClasses(status: NutritionistStatus): string {
  const config = NUTRITIONIST_STATUS_CONFIG[status];
  return `${config.bgColor} ${config.textColor}`;
}

export function formatNutritionistName(
  profile: AdminNutritionistProfile
): string {
  return `${profile.firstName} ${profile.lastName}`.trim() || 'Sans nom';
}

export function hasValidCertification(
  profile: AdminNutritionistProfile
): boolean {
  return profile.documents.some(
    doc =>
      (doc.type === 'asca_certificate' || doc.type === 'rme_certificate') &&
      doc.fileUrl
  );
}
