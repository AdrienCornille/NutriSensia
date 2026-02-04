/**
 * API Route: /api/protected/appointments/available-slots
 * Module 3.1 - Agenda (Rendez-vous)
 * AGENDA-004: Sélection créneau
 *
 * GET - Récupérer les créneaux disponibles pour un nutritionniste
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// Configuration par défaut des horaires de travail
const DEFAULT_WORK_HOURS = {
  start: 9, // 9h00
  end: 18, // 18h00
  lunchStart: 12, // 12h00
  lunchEnd: 14, // 14h00
};

// Jours de travail (0 = dimanche, 6 = samedi)
const WORK_DAYS = [1, 2, 3, 4, 5]; // Lundi à vendredi

interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
  visio_available: boolean;
  cabinet_available: boolean;
}

interface DaySlots {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayName: string;
  monthName: string;
  isAvailable: boolean;
  slots: TimeSlot[];
  slotsCount: number;
}

/**
 * Génère les créneaux horaires pour une journée donnée
 */
function generateTimeSlotsForDay(
  date: Date,
  durationMinutes: number,
  bookedSlots: Set<string>,
  workHours = DEFAULT_WORK_HOURS
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Vérifier si c'est un jour ouvré
  if (!WORK_DAYS.includes(date.getDay())) {
    return slots;
  }

  // Vérifier si la date est dans le passé
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  let currentHour = workHours.start;
  let currentMinute = 0;

  while (currentHour < workHours.end) {
    // Skip pause déjeuner
    if (currentHour >= workHours.lunchStart && currentHour < workHours.lunchEnd) {
      currentHour = workHours.lunchEnd;
      currentMinute = 0;
      continue;
    }

    const slotTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const slotKey = `${date.toISOString().split('T')[0]}_${slotTime}`;

    // Vérifier si le créneau est dans le passé (pour aujourd'hui)
    let isPast = false;
    if (isToday) {
      const slotDate = new Date(date);
      slotDate.setHours(currentHour, currentMinute, 0, 0);
      // Ajouter une marge de 2 heures (ne pas permettre de réserver moins de 2h à l'avance)
      isPast = slotDate.getTime() < now.getTime() + 2 * 60 * 60 * 1000;
    }

    const isBooked = bookedSlots.has(slotKey);
    const isAvailable = !isBooked && !isPast;

    slots.push({
      time: slotTime,
      available: isAvailable,
      visio_available: isAvailable,
      cabinet_available: isAvailable,
    });

    // Avancer de la durée de la consultation
    currentMinute += durationMinutes;
    while (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour++;
    }
  }

  return slots;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser les query params
    const { searchParams } = new URL(req.url);
    const nutritionistId = searchParams.get('nutritionist_id');
    const consultationTypeId = searchParams.get('consultation_type_id');
    const startDateStr = searchParams.get('start_date');
    const endDateStr = searchParams.get('end_date');
    const specificDateStr = searchParams.get('date'); // Pour une date spécifique

    // Validation
    if (!nutritionistId) {
      return apiResponse.error('nutritionist_id requis', 400);
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer la durée de la consultation (si type fourni)
    let consultationDuration = 30; // Défaut: 30 minutes
    if (consultationTypeId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: consultationType } = await (supabase as any)
        .from('consultation_types')
        .select('default_duration')
        .eq('id', consultationTypeId)
        .single();

      if (consultationType) {
        consultationDuration = consultationType.default_duration;
      }
    }

    // 5. Déterminer la plage de dates
    let startDate: Date;
    let endDate: Date;

    if (specificDateStr) {
      // Une seule date demandée
      startDate = new Date(specificDateStr);
      endDate = new Date(specificDateStr);
    } else if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else {
      // Par défaut: 30 prochains jours
      startDate = new Date();
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
    }

    // Limiter à 60 jours max
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 60);
    if (endDate > maxEndDate) {
      endDate = maxEndDate;
    }

    // 6. Récupérer les RDV existants du nutritionniste sur cette période
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAppointments, error: queryError } = await (supabase as any)
      .from('appointments')
      .select('scheduled_at, scheduled_end_at, duration')
      .eq('nutritionist_id', nutritionistId)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', startDate.toISOString().split('T')[0])
      .lte('scheduled_at', endDate.toISOString().split('T')[0] + 'T23:59:59Z');

    if (queryError) {
      console.error('Error fetching existing appointments:', queryError);
      return apiResponse.serverError('Erreur lors de la récupération des disponibilités');
    }

    // 7. Créer un Set des créneaux déjà réservés
    const bookedSlots = new Set<string>();
    if (existingAppointments) {
      for (const apt of existingAppointments) {
        const aptDate = new Date(apt.scheduled_at);
        const dateKey = aptDate.toISOString().split('T')[0];
        const timeKey = aptDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        bookedSlots.add(`${dateKey}_${timeKey}`);
      }
    }

    // 8. Générer les créneaux pour chaque jour
    const days: DaySlots[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayNumber = currentDate.getDate();
      const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'short' });
      const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'short' });

      const slots = generateTimeSlotsForDay(
        new Date(currentDate),
        consultationDuration,
        bookedSlots
      );

      const availableSlots = slots.filter((s) => s.available);

      days.push({
        date: dateStr,
        dayNumber,
        dayName,
        monthName,
        isAvailable: availableSlots.length > 0,
        slots,
        slotsCount: availableSlots.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 9. Si date spécifique, retourner uniquement les slots de ce jour
    if (specificDateStr) {
      const daySlots = days[0];
      return NextResponse.json(
        {
          date: daySlots.date,
          slots: daySlots.slots,
          total_available: daySlots.slotsCount,
        },
        { status: 200 }
      );
    }

    // 10. Retourner tous les jours avec leurs slots
    return NextResponse.json(
      {
        days,
        total_days: days.length,
        days_with_availability: days.filter((d) => d.isAvailable).length,
        consultation_duration: consultationDuration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/appointments/available-slots:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
