/**
 * Mock data pour la page Agenda (Rendez-vous)
 */

import type {
  Appointment,
  AvailableDay,
  AvailableSlot,
  Nutritionist,
  ReminderSettings,
  ConsultationType,
  AppointmentMode,
  BookingFormData,
} from '@/types/agenda';
import { consultationTypeConfig } from '@/types/agenda';

// ==================== NUTRITIONIST ====================

const mockNutritionist: Nutritionist = {
  id: 'nutri-1',
  name: 'Lucie Martin',
  initials: 'LM',
  cabinetAddress: 'Rue du Conseil 12, 2000 Neuchâtel',
};

// ==================== APPOINTMENTS ====================

const mockAppointments: Appointment[] = [
  // Upcoming appointments
  {
    id: 'apt-1',
    date: new Date('2026-01-24'),
    time: '14:00',
    endTime: '14:45',
    duration: 45,
    type: 'approfondi',
    typeName: 'Consultation de suivi',
    mode: 'visio',
    status: 'confirmed',
    nutritionist: mockNutritionist,
    visioLink: 'https://meet.nutrisensia.ch/abc123',
    notes: 'Bilan du premier mois, ajustement du plan si nécessaire',
    price: 110,
  },
  {
    id: 'apt-2',
    date: new Date('2026-02-21'),
    time: '10:30',
    endTime: '11:00',
    duration: 30,
    type: 'suivi',
    typeName: 'Consultation de suivi',
    mode: 'cabinet',
    status: 'confirmed',
    nutritionist: mockNutritionist,
    price: 80,
  },
  // Past appointments
  {
    id: 'apt-past-1',
    date: new Date('2026-01-15'),
    time: '14:00',
    endTime: '14:30',
    duration: 30,
    type: 'suivi',
    typeName: 'Consultation de suivi',
    mode: 'visio',
    status: 'completed',
    nutritionist: mockNutritionist,
    summary: 'Bon démarrage, -1.6 kg. Ajustement léger du plan.',
    price: 80,
  },
  {
    id: 'apt-past-2',
    date: new Date('2025-12-15'),
    time: '09:00',
    endTime: '10:00',
    duration: 60,
    type: 'approfondi',
    typeName: 'Première consultation',
    mode: 'cabinet',
    status: 'completed',
    nutritionist: mockNutritionist,
    summary:
      'Anamnèse complète, définition des objectifs, mise en place du plan initial.',
    price: 150,
  },
];

export function getAppointments(): Appointment[] {
  return mockAppointments;
}

export function getUpcomingAppointments(): Appointment[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return mockAppointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return (
        aptDate >= now &&
        apt.status !== 'cancelled' &&
        apt.status !== 'completed'
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getPastAppointments(): Appointment[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return mockAppointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate < now || apt.status === 'completed';
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ==================== AVAILABILITY ====================

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const monthNames = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];

function generateTimeSlots(date: Date): AvailableSlot[] {
  const dayOfWeek = date.getDay();

  // No appointments on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [];
  }

  const slots: AvailableSlot[] = [];
  const morningStart = 9;
  const morningEnd = 12;
  const afternoonStart = 14;
  const afternoonEnd = 17;

  // Morning slots
  for (let hour = morningStart; hour < morningEnd; hour++) {
    for (const minute of ['00', '30']) {
      // Use date string as seed for consistent randomness
      const seed = date.toISOString() + hour + minute;
      const hash = seed.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const available = Math.abs(hash % 10) > 3;

      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute}`,
        available,
      });
    }
  }

  // Afternoon slots
  for (let hour = afternoonStart; hour < afternoonEnd; hour++) {
    for (const minute of ['00', '30']) {
      const seed = date.toISOString() + hour + minute;
      const hash = seed.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const available = Math.abs(hash % 10) > 3;

      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute}`,
        available,
      });
    }
  }

  return slots;
}

export function getAvailableDays(month: Date): AvailableDay[] {
  const year = month.getFullYear();
  const monthNum = month.getMonth();
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: AvailableDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthNum, day);
    const dayOfWeek = date.getDay();
    const isPast = date < today;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const slots = generateTimeSlots(date);
    const availableSlots = slots.filter(s => s.available);

    days.push({
      dateStr: `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      date,
      dayNumber: day,
      dayName: dayNames[dayOfWeek],
      monthName: monthNames[monthNum],
      isAvailable: !isPast && !isWeekend && availableSlots.length > 0,
      slotsCount: availableSlots.length,
    });
  }

  return days;
}

export function getSlotsForDate(date: Date): AvailableSlot[] {
  return generateTimeSlots(date);
}

// ==================== REMINDER SETTINGS ====================

let mockReminderSettings: ReminderSettings = {
  emailDayBefore: true,
  pushHourBefore: true,
};

export function getReminderSettings(): ReminderSettings {
  return { ...mockReminderSettings };
}

export function updateReminderSettings(
  settings: Partial<ReminderSettings>
): ReminderSettings {
  mockReminderSettings = { ...mockReminderSettings, ...settings };
  return { ...mockReminderSettings };
}

// ==================== BOOKING ====================

export function createAppointment(data: {
  date: Date;
  time: string;
  type: ConsultationType;
  mode: AppointmentMode;
  message?: string;
}): Appointment {
  const config = consultationTypeConfig[data.type];
  const [hours, minutes] = data.time.split(':').map(Number);
  const endDate = new Date(data.date);
  endDate.setHours(hours, minutes + config.duration, 0, 0);

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    date: data.date,
    time: data.time,
    endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
    duration: config.duration,
    type: data.type,
    typeName: config.label,
    mode: data.mode,
    status: 'pending',
    nutritionist: mockNutritionist,
    visioLink:
      data.mode === 'visio'
        ? `https://meet.nutrisensia.ch/${Date.now()}`
        : undefined,
    notes: data.message,
    price: config.price,
  };

  mockAppointments.push(newAppointment);
  return newAppointment;
}

export function cancelAppointment(id: string): boolean {
  const index = mockAppointments.findIndex(apt => apt.id === id);
  if (index !== -1) {
    mockAppointments[index].status = 'cancelled';
    return true;
  }
  return false;
}

// AGENDA-007: Modifier un rendez-vous existant
export function modifyAppointment(
  id: string,
  formData: BookingFormData
): Appointment | null {
  const index = mockAppointments.findIndex(apt => apt.id === id);
  if (index === -1) return null;

  if (
    !formData.consultationType ||
    !formData.selectedDate ||
    !formData.selectedTime ||
    !formData.mode
  ) {
    return null;
  }

  const config = consultationTypeConfig[formData.consultationType];
  const [hours, minutes] = formData.selectedTime.split(':').map(Number);
  const endDate = new Date(formData.selectedDate);
  endDate.setHours(hours, minutes + config.duration, 0, 0);

  const updatedAppointment: Appointment = {
    ...mockAppointments[index],
    date: formData.selectedDate,
    time: formData.selectedTime,
    endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
    duration: config.duration,
    type: formData.consultationType,
    typeName: config.label,
    mode: formData.mode,
    visioLink:
      formData.mode === 'visio'
        ? `https://meet.nutrisensia.ch/${Date.now()}`
        : undefined,
    notes: formData.message || mockAppointments[index].notes,
    price: config.price,
  };

  mockAppointments[index] = updatedAppointment;
  return updatedAppointment;
}

export function bookAppointment(formData: BookingFormData): Appointment | null {
  if (
    !formData.consultationType ||
    !formData.selectedDate ||
    !formData.selectedTime ||
    !formData.mode
  ) {
    return null;
  }

  return createAppointment({
    date: formData.selectedDate,
    time: formData.selectedTime,
    type: formData.consultationType,
    mode: formData.mode,
    message: formData.message || undefined,
  });
}

// ==================== CONSTANTS ====================

export const CABINET_ADDRESS = mockNutritionist.cabinetAddress;
export const NUTRITIONIST_NAME = mockNutritionist.name;
