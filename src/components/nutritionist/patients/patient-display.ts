import type { PatientListItem } from '@/hooks/useNutritionistPatients';

export type DerivedChipKind =
  | 'nouveau'
  | 'actif'
  | 'paused'
  | 'relance'
  | 'plateau'
  | 'done';

export interface DerivedChip {
  kind: DerivedChipKind;
  label: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function deriveChip(
  p: PatientListItem,
  now: Date = new Date()
): DerivedChip {
  if (p.status === 'pending') return { kind: 'nouveau', label: 'Nouveau' };
  if (p.status === 'inactive') return { kind: 'paused', label: 'En pause' };

  if (p.appointments_count >= 10 && !p.next_appointment_at) {
    return { kind: 'done', label: 'Fin de cycle' };
  }

  if (p.last_appointment_at && !p.next_appointment_at) {
    const daysSince = Math.floor(
      (now.getTime() - new Date(p.last_appointment_at).getTime()) / MS_PER_DAY
    );
    if (daysSince >= 14) return { kind: 'relance', label: 'À relancer' };
  }

  if (
    p.initial_weight &&
    p.current_weight &&
    p.appointments_count >= 5 &&
    Math.abs(p.current_weight - p.initial_weight) / p.initial_weight < 0.01
  ) {
    return { kind: 'plateau', label: 'Plateau' };
  }

  return { kind: 'actif', label: 'Actif' };
}

export interface DerivedTrend {
  value: string;
  delta: string | null;
  direction: 'up' | 'down' | 'flat';
}

export function deriveTrend(p: PatientListItem): DerivedTrend {
  if (p.current_weight == null) {
    return { value: '—', delta: null, direction: 'flat' };
  }
  const value = `${formatNumber(p.current_weight)} kg`;
  if (p.initial_weight == null) {
    return { value, delta: null, direction: 'flat' };
  }
  const diff = p.current_weight - p.initial_weight;
  const absDiff = Math.abs(diff);
  if (absDiff < 0.5) {
    return { value, delta: 'stable', direction: 'flat' };
  }
  const direction: 'up' | 'down' = diff > 0 ? 'up' : 'down';
  const sign = direction === 'down' ? '-' : '+';
  return { value, delta: `${sign}${formatNumber(absDiff)} kg`, direction };
}

export function deriveSparklineHeights(p: PatientListItem): number[] {
  const initial = p.initial_weight;
  const current = p.current_weight;
  if (initial == null || current == null) {
    return [20, 20, 20, 20, 20, 20, 20];
  }
  const min = Math.min(initial, current) * 0.92;
  const max = Math.max(initial, current) * 1.08;
  const range = Math.max(max - min, 1);

  const points: number[] = [];
  for (let i = 0; i < 7; i += 1) {
    const t = i / 6;
    const weight = initial + (current - initial) * t;
    const pct = Math.round(((weight - min) / range) * 100);
    points.push(Math.max(15, Math.min(95, pct)));
  }
  return points;
}

export interface DerivedAlert {
  tone: 'warn' | 'good' | 'info';
  text: string;
  emphasis?: string;
}

export function deriveAlert(
  p: PatientListItem,
  chip: DerivedChip,
  now: Date = new Date()
): DerivedAlert | null {
  const a = p.alerts;

  if (a && a.pending_modification_requests > 0) {
    const n = a.pending_modification_requests;
    return {
      tone: 'warn',
      text: `${n} demande${n > 1 ? 's' : ''} de modification à examiner.`,
      emphasis: 'À traiter',
    };
  }

  if (a && a.unread_messages > 0) {
    const n = a.unread_messages;
    return {
      tone: 'warn',
      text: `${n} message${n > 1 ? 's' : ''} en attente de réponse.`,
      emphasis: 'Messagerie',
    };
  }

  if (chip.kind === 'relance' && p.last_appointment_at) {
    const daysSince = Math.floor(
      (now.getTime() - new Date(p.last_appointment_at).getTime()) / MS_PER_DAY
    );
    return {
      tone: 'warn',
      text: `Silence depuis ${daysSince} jours — relance suggérée.`,
      emphasis: `${daysSince}j`,
    };
  }

  if (chip.kind === 'plateau') {
    return {
      tone: 'warn',
      text: 'Plateau de poids — adapter la stratégie.',
      emphasis: 'Plateau',
    };
  }

  if (chip.kind === 'nouveau') {
    return {
      tone: 'info',
      text: 'Première consultation à préparer.',
      emphasis: 'Nouveau',
    };
  }

  if (chip.kind === 'done') {
    return {
      tone: 'info',
      text: `${p.appointments_count} consultations bouclées — espacement ou clôture.`,
      emphasis: 'Fin de cycle',
    };
  }

  if (a && a.days_without_meal != null && a.days_without_meal >= 5) {
    return {
      tone: 'warn',
      text: `Aucun repas enregistré depuis ${a.days_without_meal} jours.`,
      emphasis: 'Inactif',
    };
  }

  if (a && a.adherence_percent != null && a.adherence_percent < 50) {
    return {
      tone: 'warn',
      text: `Adhérence ${a.adherence_percent}% — à recadrer.`,
      emphasis: `${a.adherence_percent}%`,
    };
  }

  if (a && a.adherence_percent != null && a.adherence_percent >= 80) {
    return {
      tone: 'good',
      text: `Adhérence ${a.adherence_percent}% — excellente dynamique.`,
      emphasis: `${a.adherence_percent}%`,
    };
  }

  return null;
}

export function isPatientToWatch(
  p: PatientListItem,
  now: Date = new Date()
): boolean {
  const chip = deriveChip(p, now);
  if (chip.kind === 'relance' || chip.kind === 'plateau') return true;
  const a = p.alerts;
  if (!a) return false;
  if (a.pending_modification_requests > 0) return true;
  if (a.unread_messages > 0) return true;
  if (a.adherence_percent != null && a.adherence_percent < 50) return true;
  if (a.days_without_meal != null && a.days_without_meal >= 5) return true;
  return false;
}

export function countNewThisMonth(
  patients: PatientListItem[],
  now: Date = new Date()
): number {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return patients.filter(p => {
    const ref = p.assigned_at ?? p.created_at;
    return new Date(ref).getTime() >= monthStart;
  }).length;
}

export function formatPatientDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function formatAppointmentLabel(
  dateStr: string | null,
  now: Date = new Date()
): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + MS_PER_DAY);
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (dayStart.getTime() === today.getTime()) {
    return `Aujourd'hui · ${time}`;
  }
  if (dayStart.getTime() === tomorrow.getTime()) {
    return `Demain · ${time}`;
  }
  return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${time}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
