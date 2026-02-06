/**
 * ICS Calendar File Generator
 *
 * Génère des fichiers .ics (iCalendar) pour permettre aux utilisateurs
 * d'ajouter leurs rendez-vous à leur calendrier (Apple, Google, Outlook).
 *
 * Format: RFC 5545 (iCalendar)
 */

export interface ICSEventData {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  url?: string;
  startDate: Date;
  endDate: Date;
  organizerName?: string;
  organizerEmail?: string;
  attendeeName?: string;
  attendeeEmail?: string;
}

/**
 * Formate une date en format iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatDateToICS(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Échappe les caractères spéciaux pour le format ICS
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Génère le contenu d'un fichier .ics pour un événement
 */
export function generateICSContent(event: ICSEventData): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NutriSensia//Appointment Calendar//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}@nutrisensia.ch`,
    `DTSTAMP:${formatDateToICS(new Date())}`,
    `DTSTART:${formatDateToICS(event.startDate)}`,
    `DTEND:${formatDateToICS(event.endDate)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
  ];

  // Description (inclut le lien visio si présent)
  let description = event.description || '';
  if (event.url) {
    description += description ? '\\n\\n' : '';
    description += `Lien de la consultation : ${event.url}`;
  }
  if (description) {
    lines.push(`DESCRIPTION:${escapeICSText(description)}`);
  }

  // Location (peut être une URL pour les visioconférences)
  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`);
  } else if (event.url) {
    lines.push(`LOCATION:${escapeICSText(event.url)}`);
  }

  // URL du rendez-vous
  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  // Organisateur (nutritionniste)
  if (event.organizerEmail) {
    const organizerName = event.organizerName || 'NutriSensia';
    lines.push(
      `ORGANIZER;CN=${escapeICSText(organizerName)}:mailto:${event.organizerEmail}`
    );
  }

  // Participant (patient)
  if (event.attendeeEmail) {
    const attendeeName = event.attendeeName || 'Patient';
    lines.push(
      `ATTENDEE;CN=${escapeICSText(attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}`
    );
  }

  // Rappel 1 heure avant
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Consultation NutriSensia dans 1 heure',
    'TRIGGER:-PT1H',
    'END:VALARM'
  );

  // Rappel 15 minutes avant
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Consultation NutriSensia dans 15 minutes',
    'TRIGGER:-PT15M',
    'END:VALARM'
  );

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Génère un nom de fichier pour le .ics
 */
export function generateICSFilename(title: string, date: Date): string {
  const dateStr = date.toISOString().split('T')[0];
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  return `nutrisensia-${sanitizedTitle}-${dateStr}.ics`;
}

/**
 * Types de consultation pour les titres
 */
export const CONSULTATION_TYPE_NAMES: Record<
  string,
  { fr: string; en: string }
> = {
  initial: { fr: 'Consultation initiale', en: 'Initial consultation' },
  follow_up: { fr: 'Consultation de suivi', en: 'Follow-up consultation' },
  in_depth: { fr: 'Consultation approfondie', en: 'In-depth consultation' },
  emergency: { fr: 'Consultation urgente', en: 'Urgent consultation' },
};

/**
 * Génère les données ICS à partir d'un rendez-vous NutriSensia
 */
export function createICSEventFromAppointment(
  appointment: {
    id: string;
    scheduled_at: string;
    scheduled_end_at?: string;
    duration?: number;
    consultation_type_code?: string;
    mode?: 'visio' | 'cabinet' | 'phone';
    visio_link?: string | null;
    patient_message?: string | null;
    nutritionist?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    } | null;
    patient?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    } | null;
  },
  locale: string = 'fr'
): ICSEventData {
  const startDate = new Date(appointment.scheduled_at);

  // Calculer la date de fin
  let endDate: Date;
  if (appointment.scheduled_end_at) {
    endDate = new Date(appointment.scheduled_end_at);
  } else {
    const durationMinutes = appointment.duration || 30;
    endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  }

  // Titre basé sur le type de consultation
  const typeCode = appointment.consultation_type_code || 'follow_up';
  const typeName =
    CONSULTATION_TYPE_NAMES[typeCode]?.[locale as 'fr' | 'en'] ||
    CONSULTATION_TYPE_NAMES[typeCode]?.fr ||
    'Consultation NutriSensia';

  // Description
  let description = `${typeName} avec NutriSensia`;
  if (appointment.nutritionist) {
    const nutName =
      `${appointment.nutritionist.first_name || ''} ${appointment.nutritionist.last_name || ''}`.trim();
    if (nutName) {
      description += `\nNutritionniste: ${nutName}`;
    }
  }
  if (appointment.patient_message) {
    description += `\n\nMessage: ${appointment.patient_message}`;
  }

  // Location basée sur le mode
  let location: string | undefined;
  if (appointment.mode === 'visio' && appointment.visio_link) {
    location = 'Visioconférence';
  } else if (appointment.mode === 'cabinet') {
    location = 'Cabinet NutriSensia';
  } else if (appointment.mode === 'phone') {
    location = 'Consultation téléphonique';
  }

  return {
    uid: appointment.id,
    title: `${typeName} - NutriSensia`,
    description,
    location,
    url: appointment.visio_link || undefined,
    startDate,
    endDate,
    organizerName: appointment.nutritionist
      ? `${appointment.nutritionist.first_name || ''} ${appointment.nutritionist.last_name || ''}`.trim() ||
        'NutriSensia'
      : 'NutriSensia',
    organizerEmail: appointment.nutritionist?.email || 'contact@nutrisensia.ch',
    attendeeName: appointment.patient
      ? `${appointment.patient.first_name || ''} ${appointment.patient.last_name || ''}`.trim()
      : undefined,
    attendeeEmail: appointment.patient?.email,
  };
}
