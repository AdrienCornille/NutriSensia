/**
 * Types pour la page Agenda (Rendez-vous)
 *
 * AGENDA-001: Visualisation RDV à venir
 * AGENDA-002: Historique RDV passés
 * AGENDA-003: Booking - Choix type consultation
 * AGENDA-004: Booking - Sélection créneau
 * AGENDA-005: Booking - Choix mode
 * AGENDA-006: Confirmation réservation
 * AGENDA-007: Modification RDV
 * AGENDA-008: Annulation RDV
 * AGENDA-009: Rappels RDV
 * AGENDA-010: Rejoindre visio
 */

// ==================== ENUMS ====================

export type AgendaTab = 'upcoming' | 'past';

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type AppointmentMode = 'visio' | 'cabinet';

export type ConsultationType = 'suivi' | 'approfondi' | 'urgence';

export type BookingStep = 1 | 2 | 3;

// ==================== INTERFACES ====================

export interface Nutritionist {
  id: string;
  name: string;
  initials: string;
  cabinetAddress?: string;
}

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  endTime: string;
  duration: number;
  type: ConsultationType;
  typeName: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
  nutritionist: Nutritionist;
  visioLink?: string;
  notes?: string;
  summary?: string;
  price: number;
}

export interface ConsultationTypeConfig {
  id: ConsultationType;
  label: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface AvailableDay {
  date: Date;
  dayNumber: number;
  dayName: string;
  monthName: string;
  isAvailable: boolean;
  slotsCount: number;
}

export interface BookingFormData {
  consultationType: ConsultationType | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  mode: AppointmentMode | null;
  message: string;
  sendReminders: boolean;
}

export interface BookingState {
  step: BookingStep;
  formData: BookingFormData;
  isSubmitting: boolean;
  error: string | null;
}

export interface ReminderSettings {
  emailDayBefore: boolean;
  pushHourBefore: boolean;
}

// ==================== PAGE STATE ====================

export interface AgendaState {
  activeTab: AgendaTab;
  showBookingModal: boolean;
  showDetailModal: boolean;
  showCancellationModal: boolean; // AGENDA-008
  selectedAppointment: Appointment | null;
  editingAppointment: Appointment | null; // AGENDA-007: Appointment being modified
  bookingState: BookingState;
  reminderSettings: ReminderSettings;
  currentMonth: Date;
  // Appointments stored in state for immediate UI updates (AGENDA-006)
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  appointmentsLoaded: boolean;
}

// ==================== ACTIONS ====================

export type AgendaAction =
  | { type: 'SET_TAB'; tab: AgendaTab }
  | { type: 'OPEN_BOOKING_MODAL' }
  | { type: 'CLOSE_BOOKING_MODAL' }
  | { type: 'SET_BOOKING_STEP'; step: BookingStep }
  | { type: 'UPDATE_BOOKING_FORM'; data: Partial<BookingFormData> }
  | { type: 'RESET_BOOKING' }
  | { type: 'SET_BOOKING_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_BOOKING_ERROR'; error: string | null }
  | { type: 'OPEN_DETAIL_MODAL'; appointment: Appointment }
  | { type: 'CLOSE_DETAIL_MODAL' }
  | { type: 'UPDATE_REMINDER_SETTINGS'; settings: Partial<ReminderSettings> }
  | { type: 'SET_CURRENT_MONTH'; month: Date }
  // AGENDA-006: Immediate state updates for appointments
  | { type: 'SET_APPOINTMENTS'; upcoming: Appointment[]; past: Appointment[] }
  | { type: 'ADD_APPOINTMENT'; appointment: Appointment }
  | { type: 'CANCEL_APPOINTMENT'; appointmentId: string }
  // AGENDA-007: Modification RDV
  | { type: 'START_EDITING_APPOINTMENT'; appointment: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; appointment: Appointment }
  // AGENDA-008: Annulation RDV
  | { type: 'OPEN_CANCELLATION_MODAL'; appointment: Appointment }
  | { type: 'CLOSE_CANCELLATION_MODAL' };

// ==================== INITIAL STATE ====================

export const initialBookingFormData: BookingFormData = {
  consultationType: null,
  selectedDate: null,
  selectedTime: null,
  mode: null,
  message: '',
  sendReminders: true,
};

export const initialBookingState: BookingState = {
  step: 1,
  formData: initialBookingFormData,
  isSubmitting: false,
  error: null,
};

export const initialAgendaState: AgendaState = {
  activeTab: 'upcoming',
  showBookingModal: false,
  showDetailModal: false,
  showCancellationModal: false, // AGENDA-008
  selectedAppointment: null,
  editingAppointment: null, // AGENDA-007
  bookingState: initialBookingState,
  reminderSettings: {
    emailDayBefore: true,
    pushHourBefore: true,
  },
  currentMonth: new Date(),
  // AGENDA-006: Appointments in state for immediate updates
  upcomingAppointments: [],
  pastAppointments: [],
  appointmentsLoaded: false,
};

// ==================== REDUCER ====================

export function agendaReducer(state: AgendaState, action: AgendaAction): AgendaState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    case 'OPEN_BOOKING_MODAL':
      return {
        ...state,
        showBookingModal: true,
        bookingState: initialBookingState,
      };

    case 'CLOSE_BOOKING_MODAL':
      return {
        ...state,
        showBookingModal: false,
        bookingState: initialBookingState,
      };

    case 'SET_BOOKING_STEP':
      return {
        ...state,
        bookingState: { ...state.bookingState, step: action.step },
      };

    case 'UPDATE_BOOKING_FORM':
      return {
        ...state,
        bookingState: {
          ...state.bookingState,
          formData: { ...state.bookingState.formData, ...action.data },
        },
      };

    case 'RESET_BOOKING':
      return { ...state, bookingState: initialBookingState };

    case 'SET_BOOKING_SUBMITTING':
      return {
        ...state,
        bookingState: { ...state.bookingState, isSubmitting: action.isSubmitting },
      };

    case 'SET_BOOKING_ERROR':
      return {
        ...state,
        bookingState: { ...state.bookingState, error: action.error },
      };

    case 'OPEN_DETAIL_MODAL':
      return {
        ...state,
        showDetailModal: true,
        selectedAppointment: action.appointment,
      };

    case 'CLOSE_DETAIL_MODAL':
      return {
        ...state,
        showDetailModal: false,
        selectedAppointment: null,
      };

    case 'UPDATE_REMINDER_SETTINGS':
      return {
        ...state,
        reminderSettings: { ...state.reminderSettings, ...action.settings },
      };

    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.month };

    // AGENDA-006: Immediate state updates for appointments
    case 'SET_APPOINTMENTS':
      return {
        ...state,
        upcomingAppointments: action.upcoming,
        pastAppointments: action.past,
        appointmentsLoaded: true,
      };

    case 'ADD_APPOINTMENT':
      return {
        ...state,
        upcomingAppointments: [...state.upcomingAppointments, action.appointment].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      };

    case 'CANCEL_APPOINTMENT':
      return {
        ...state,
        upcomingAppointments: state.upcomingAppointments.map((apt) =>
          apt.id === action.appointmentId ? { ...apt, status: 'cancelled' as AppointmentStatus } : apt
        ),
      };

    // AGENDA-007: Modification RDV
    case 'START_EDITING_APPOINTMENT':
      return {
        ...state,
        showDetailModal: false,
        showBookingModal: true,
        editingAppointment: action.appointment,
        currentMonth: new Date(action.appointment.date),
        bookingState: {
          ...initialBookingState,
          step: 2, // Skip type selection, go directly to slot selection
          formData: {
            consultationType: action.appointment.type,
            selectedDate: new Date(action.appointment.date),
            selectedTime: action.appointment.time,
            mode: action.appointment.mode,
            message: action.appointment.notes || '',
            sendReminders: true,
          },
        },
      };

    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        showBookingModal: false,
        editingAppointment: null,
        bookingState: initialBookingState,
        upcomingAppointments: state.upcomingAppointments.map((apt) =>
          apt.id === action.appointment.id ? action.appointment : apt
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      };

    // AGENDA-008: Annulation RDV
    case 'OPEN_CANCELLATION_MODAL':
      return {
        ...state,
        showDetailModal: false,
        showCancellationModal: true,
        selectedAppointment: action.appointment,
      };

    case 'CLOSE_CANCELLATION_MODAL':
      return {
        ...state,
        showCancellationModal: false,
        selectedAppointment: null,
      };

    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================

export const agendaTabsConfig: { id: AgendaTab; label: string }[] = [
  { id: 'upcoming', label: 'À venir' },
  { id: 'past', label: 'Passés' },
];

export const appointmentStatusConfig: Record<
  AppointmentStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  confirmed: {
    label: 'Confirmé',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  pending: {
    label: 'En attente',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  cancelled: {
    label: 'Annulé',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  completed: {
    label: 'Terminé',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

export const appointmentModeConfig: Record<
  AppointmentMode,
  { label: string; icon: string; bgColor: string; textColor: string }
> = {
  visio: {
    label: 'Visio',
    icon: '📹',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  cabinet: {
    label: 'Cabinet',
    icon: '🏢',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
};

export const consultationTypeConfig: Record<ConsultationType, ConsultationTypeConfig> = {
  suivi: {
    id: 'suivi',
    label: 'Consultation de suivi',
    description: 'Point régulier sur votre progression',
    duration: 30,
    price: 80,
    icon: '🔄',
  },
  approfondi: {
    id: 'approfondi',
    label: 'Consultation approfondie',
    description: 'Bilan détaillé et ajustements du plan',
    duration: 45,
    price: 110,
    icon: '📊',
  },
  urgence: {
    id: 'urgence',
    label: 'Consultation urgente',
    description: 'Question urgente ou problème ponctuel',
    duration: 20,
    price: 50,
    icon: '⚡',
  },
};

// ==================== HELPERS ====================

/**
 * Calcule le temps restant avant un RDV (countdown)
 */
export function getCountdown(appointmentDate: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const appointmentDateTime = new Date(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffMs = appointmentDateTime.getTime() - now.getTime();

  if (diffMs < 0) return 'Passé';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
  if (diffHours > 0) {
    return `Dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  }
  return 'Imminent';
}

/**
 * Vérifie si le bouton "Rejoindre visio" doit être actif (15 min avant)
 */
export function isVisioLinkActive(appointmentDate: Date, time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const appointmentDateTime = new Date(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffMs = appointmentDateTime.getTime() - now.getTime();
  const fifteenMinutes = 15 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  return diffMs <= fifteenMinutes && diffMs >= -oneHour;
}

/**
 * Vérifie si un RDV peut être modifié (plus de 24h avant)
 */
export function canModifyAppointment(appointmentDate: Date, time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const appointmentDateTime = new Date(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffMs = appointmentDateTime.getTime() - now.getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return diffMs > twentyFourHours;
}

/**
 * Formate une date pour l'affichage complet (ex: "Lundi 20 janvier 2026")
 */
export function formatAppointmentDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate une date courte (ex: "20 jan.")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Retourne le jour et le mois séparément
 */
export function formatDateParts(date: Date): { day: string; month: string } {
  return {
    day: date.getDate().toString(),
    month: date
      .toLocaleDateString('fr-FR', { month: 'short' })
      .toUpperCase()
      .replace('.', ''),
  };
}

/**
 * Retourne le prochain RDV à venir
 */
export function getNextAppointment(appointments: Appointment[]): Appointment | null {
  const now = new Date();

  const upcoming = appointments
    .filter((apt) => {
      const [hours, minutes] = apt.time.split(':').map(Number);
      const aptDate = new Date(apt.date);
      aptDate.setHours(hours, minutes, 0, 0);
      return aptDate > now && apt.status !== 'cancelled';
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  return upcoming[0] || null;
}

/**
 * Calcule les statistiques des RDV passés
 */
export function calculateAgendaStats(appointments: Appointment[]): {
  totalConsultations: number;
  firstConsultationDate: Date | null;
  followUpDuration: string;
} {
  const completedAppointments = appointments
    .filter((apt) => apt.status === 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const firstDate = completedAppointments[0]?.date || null;

  let followUpDuration = '-';
  if (firstDate) {
    const now = new Date();
    const diffMs = now.getTime() - new Date(firstDate).getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    followUpDuration = diffMonths > 0 ? `${diffMonths} mois` : "Moins d'1 mois";
  }

  return {
    totalConsultations: completedAppointments.length,
    firstConsultationDate: firstDate ? new Date(firstDate) : null,
    followUpDuration,
  };
}

/**
 * Formate le mois pour le calendrier (ex: "Janvier 2026")
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}
