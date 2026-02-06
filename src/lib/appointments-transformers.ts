/**
 * Transformers pour le module Agenda/Rendez-vous (Phase 3 - Module 3.1)
 *
 * Ce fichier gère les conversions entre :
 * - Types UI (frontend) : ConsultationType = 'suivi' | 'approfondi' | 'urgence'
 * - Types API (backend) : consultation_type_code = 'follow_up' | 'in_depth' | 'emergency' | 'initial'
 */

import type {
  Appointment,
  AppointmentStatus,
  AppointmentMode,
  ConsultationType,
  CancellationSource,
  Nutritionist,
} from '@/types/agenda';

// ============================================================================
// TYPES API
// ============================================================================

// Statut RDV côté DB (doit correspondre à l'enum appointment_status)
export type AppointmentStatusAPI =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'cancelled_by_patient'
  | 'cancelled_by_nutritionist'
  | 'completed'
  | 'no_show';

// Mode consultation côté DB
export type ConsultationModeAPI = 'visio' | 'cabinet' | 'phone';

// Code type consultation côté DB
export type ConsultationTypeCodeAPI =
  | 'initial'
  | 'follow_up'
  | 'in_depth'
  | 'emergency'
  | 'check_in';

// Type consultation retourné par la jointure
export interface ConsultationTypeRecord {
  id: string;
  code: string;
  name_fr: string;
  name_en: string | null;
  default_duration: number;
  default_price: number;
  icon: string | null;
  color: string | null;
}

// Nutritionniste retourné par la jointure
// Note: Les noms (first_name, last_name) ne sont pas disponibles directement
// car il n'y a pas de FK entre nutritionist_profiles et profiles
export interface NutritionistRecord {
  id: string;
  user_id: string;
  title: string | null;
  cabinet_name: string | null;
  cabinet_address_line1: string | null;
  cabinet_address_line2: string | null;
  cabinet_city: string | null;
  cabinet_postal_code: string | null;
}

// RDV tel que retourné par l'API
// Note: La colonne est 'user_id' dans la DB (référence patient_profiles.id)
export interface AppointmentAPI {
  id: string;
  user_id: string; // Référence patient_profiles.id
  nutritionist_id: string;
  consultation_type_id: string;
  consultation_type_code: string;
  scheduled_at: string; // ISO datetime
  scheduled_end_at: string;
  duration: number;
  timezone: string;
  mode: ConsultationModeAPI;
  location: string | null;
  visio_link: string | null;
  visio_room_id: string | null;
  status: AppointmentStatusAPI;
  status_changed_at: string | null;
  status_reason: string | null;
  patient_message: string | null;
  nutritionist_notes_internal: string | null;
  price: number;
  currency: string;
  is_paid: boolean;
  booking_source: string;
  is_first_consultation: boolean;
  created_at: string;
  updated_at: string;
  // Jointures
  consultation_type?: ConsultationTypeRecord;
  nutritionist?: NutritionistRecord;
}

// Réponse liste des RDV
export interface AppointmentsListResponse {
  appointments: AppointmentAPI[];
  total: number;
  upcoming_count: number;
  past_count: number;
}

// Réponse prochain RDV
export interface NextAppointmentResponse {
  appointment: AppointmentAPI | null;
  countdown_days: number | null;
}

// Slot disponible
export interface AvailableSlotAPI {
  slot_start: string; // HH:mm
  slot_end: string;
  visio_available: boolean;
  cabinet_available: boolean;
}

// Jour avec disponibilité
export interface AvailableDayAPI {
  date: string; // YYYY-MM-DD
  slots: AvailableSlotAPI[];
  total_slots: number;
}

// ============================================================================
// MAPPINGS CONSULTATION TYPE : UI <-> API
// ============================================================================

/**
 * Mapping UI → API pour le type de consultation
 * Note: 'initial' n'est pas dans le frontend (première consultation automatique)
 */
export const consultationTypeUItoAPI: Record<
  ConsultationType,
  ConsultationTypeCodeAPI
> = {
  suivi: 'follow_up',
  approfondi: 'in_depth',
  urgence: 'emergency',
};

/**
 * Mapping API → UI pour le type de consultation
 */
export const consultationTypeAPItoUI: Record<
  ConsultationTypeCodeAPI,
  ConsultationType
> = {
  initial: 'approfondi', // Première consultation → approfondi (même durée)
  follow_up: 'suivi',
  in_depth: 'approfondi',
  emergency: 'urgence',
  check_in: 'suivi', // Check-in → suivi
};

/**
 * Convertit un code de consultation API en type UI
 */
export function getConsultationTypeUI(
  code: string | undefined
): ConsultationType {
  if (!code) return 'suivi';
  return consultationTypeAPItoUI[code as ConsultationTypeCodeAPI] || 'suivi';
}

/**
 * Retourne le label français pour un type de consultation
 */
export function getConsultationTypeLabel(code: string): string {
  const labels: Record<string, string> = {
    initial: 'Consultation initiale',
    follow_up: 'Consultation de suivi',
    in_depth: 'Consultation approfondie',
    emergency: 'Consultation urgente',
    check_in: 'Point rapide',
  };
  return labels[code] || 'Consultation';
}

// ============================================================================
// MAPPINGS STATUS : UI <-> API
// ============================================================================

/**
 * Mapping API → UI pour le statut
 * Le frontend a un statut 'cancelled' générique qui correspond aux différents statuts d'annulation de la DB
 */
export const statusAPItoUI: Record<AppointmentStatusAPI, AppointmentStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled', // Legacy (pour compatibilité)
  cancelled_by_patient: 'cancelled',
  cancelled_by_nutritionist: 'cancelled',
  completed: 'completed',
  no_show: 'cancelled', // No-show traité comme annulé côté UI
};

/**
 * Extrait la source d'annulation à partir du statut API
 */
export function getCancellationSource(
  status: AppointmentStatusAPI
): 'patient' | 'nutritionist' | undefined {
  if (status === 'cancelled_by_patient') return 'patient';
  if (status === 'cancelled_by_nutritionist') return 'nutritionist';
  return undefined;
}

/**
 * Mapping UI → API pour le statut (lors de l'annulation)
 * @param status - Statut UI
 * @param cancelledBy - Qui annule (patient ou nutritionist)
 */
export function statusUItoAPI(
  status: AppointmentStatus,
  cancelledBy?: 'patient' | 'nutritionist'
): AppointmentStatusAPI {
  if (status === 'cancelled' && cancelledBy) {
    return cancelledBy === 'patient'
      ? 'cancelled_by_patient'
      : 'cancelled_by_nutritionist';
  }
  return status as AppointmentStatusAPI;
}

// ============================================================================
// MAPPINGS MODE : UI <-> API
// ============================================================================

/**
 * Mapping API → UI pour le mode
 * Note: 'phone' n'existe pas dans le frontend, mappé vers 'cabinet'
 */
export function modeAPItoUI(mode: ConsultationModeAPI): AppointmentMode {
  if (mode === 'phone') return 'cabinet'; // Fallback
  return mode as AppointmentMode;
}

/**
 * Mapping UI → API pour le mode
 */
export function modeUItoAPI(mode: AppointmentMode): ConsultationModeAPI {
  return mode;
}

// ============================================================================
// TRANSFORMERS : API → UI
// ============================================================================

/**
 * Extrait les initiales d'un nom complet
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Formate l'adresse du cabinet
 */
function formatCabinetAddress(
  nutri: NutritionistRecord | undefined
): string | undefined {
  if (!nutri?.cabinet_address_line1) return undefined;

  const parts = [
    nutri.cabinet_address_line1,
    nutri.cabinet_address_line2,
    nutri.cabinet_postal_code && nutri.cabinet_city
      ? `${nutri.cabinet_postal_code} ${nutri.cabinet_city}`
      : nutri.cabinet_city,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Transforme un nutritionniste API en format UI
 * Note: Les noms ne sont pas disponibles via la jointure (pas de FK directe)
 * On utilise le titre ou le nom du cabinet comme fallback
 */
function transformNutritionist(
  nutri: NutritionistRecord | undefined
): Nutritionist {
  if (!nutri) {
    return {
      id: '',
      name: 'Nutritionniste',
      initials: 'NN',
    };
  }

  // Utiliser le titre ou le nom du cabinet comme nom affiché
  const displayName = nutri.title || nutri.cabinet_name || 'Nutritionniste';

  return {
    id: nutri.id,
    name: displayName,
    initials: displayName.substring(0, 2).toUpperCase(),
    cabinetAddress: formatCabinetAddress(nutri),
  };
}

/**
 * Transforme un RDV API en format UI
 */
export function transformAppointmentToUI(apt: AppointmentAPI): Appointment {
  // Parser les dates
  const scheduledAt = new Date(apt.scheduled_at);
  const scheduledEndAt = new Date(apt.scheduled_end_at);

  // Extraire l'heure au format HH:mm
  const time = scheduledAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const endTime = scheduledEndAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Déterminer le type et son label
  const typeCode =
    apt.consultation_type_code || apt.consultation_type?.code || 'follow_up';
  const type = getConsultationTypeUI(typeCode);
  const typeName =
    apt.consultation_type?.name_fr || getConsultationTypeLabel(typeCode);

  return {
    id: apt.id,
    date: scheduledAt,
    time,
    endTime,
    duration: apt.duration,
    type,
    typeName,
    consultationTypeId: apt.consultation_type_id,
    mode: modeAPItoUI(apt.mode),
    status: statusAPItoUI[apt.status],
    cancelledBy: getCancellationSource(apt.status) as
      | CancellationSource
      | undefined,
    cancellationReason:
      (apt.status === 'cancelled_by_nutritionist' || apt.status === 'cancelled_by_patient') && apt.status_reason && apt.status_reason !== 'counter_proposal'
        ? (apt.status_reason.startsWith('declined:') ? apt.status_reason.slice(9) : apt.status_reason)
        : undefined,
    isDeclinedByNutritionist:
      apt.status === 'cancelled_by_nutritionist' && apt.status_reason?.startsWith('declined:'),
    nutritionist: transformNutritionist(apt.nutritionist),
    visioLink: apt.visio_link || undefined,
    notes: apt.patient_message || undefined,
    summary: apt.nutritionist_notes_internal || undefined,
    price: apt.price,
    isCounterProposal:
      apt.status === 'pending' && apt.status_reason === 'counter_proposal',
    counterProposalMessage:
      apt.status_reason === 'counter_proposal'
        ? apt.nutritionist_notes_internal || undefined
        : undefined,
  };
}

/**
 * Transforme une liste de RDV API en format UI
 */
export function transformAppointmentsData(response: AppointmentsListResponse): {
  upcoming: Appointment[];
  past: Appointment[];
} {
  const now = new Date();

  const all = response.appointments.map(transformAppointmentToUI);

  const upcoming = all
    .filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(
        parseInt(apt.time.split(':')[0]),
        parseInt(apt.time.split(':')[1])
      );
      return aptDate >= now && apt.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const past = all
    .filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(
        parseInt(apt.time.split(':')[0]),
        parseInt(apt.time.split(':')[1])
      );
      return aptDate < now || apt.status === 'completed';
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { upcoming, past };
}

// ============================================================================
// TRANSFORMERS : UI → API (pour les mutations)
// ============================================================================

export interface CreateAppointmentUI {
  nutritionistId: string;
  consultationType: ConsultationType;
  scheduledAt: Date;
  mode: AppointmentMode;
  message?: string;
  sendReminders?: boolean;
}

/**
 * Transforme les données de booking UI en format API
 */
export function transformBookingToAPI(data: CreateAppointmentUI): {
  nutritionist_id: string;
  consultation_type_code: string;
  scheduled_at: string;
  mode: ConsultationModeAPI;
  patient_message?: string;
} {
  return {
    nutritionist_id: data.nutritionistId,
    consultation_type_code: consultationTypeUItoAPI[data.consultationType],
    scheduled_at: data.scheduledAt.toISOString(),
    mode: modeUItoAPI(data.mode),
    ...(data.message && { patient_message: data.message }),
  };
}

export interface UpdateAppointmentUI {
  scheduledAt?: Date;
  mode?: AppointmentMode;
  message?: string;
}

/**
 * Transforme les données de modification UI en format API
 */
export function transformUpdateToAPI(data: UpdateAppointmentUI): {
  scheduled_at?: string;
  mode?: ConsultationModeAPI;
  patient_message?: string;
} {
  return {
    ...(data.scheduledAt && { scheduled_at: data.scheduledAt.toISOString() }),
    ...(data.mode && { mode: modeUItoAPI(data.mode) }),
    ...(data.message !== undefined && { patient_message: data.message }),
  };
}

// ============================================================================
// HELPERS POUR LES SLOTS
// ============================================================================

/**
 * Transforme les slots disponibles API en format UI
 */
export function transformAvailableSlots(
  slots: AvailableSlotAPI[]
): { time: string; available: boolean }[] {
  return slots.map(slot => ({
    time: slot.slot_start,
    available: true, // Les slots retournés sont disponibles
  }));
}

/**
 * Calcule le countdown en jours jusqu'à un RDV
 */
export function calculateCountdownDays(scheduledAt: string): number {
  const now = new Date();
  const aptDate = new Date(scheduledAt);
  const diffMs = aptDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
