/**
 * API Route: /api/protected/appointments/available-slots
 * Module 3.1 - Agenda (Rendez-vous)
 * AGENDA-004: Sélection créneau
 *
 * GET - Récupérer les créneaux disponibles pour un nutritionniste
 * Lit les disponibilités depuis nutritionist_availability en base
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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

interface AvailabilityRow {
  id: string;
  availability_type: 'recurring' | 'exception' | 'blocked';
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  specific_date: string | null;
  consultation_type_id: string | null;
  visio_available: boolean;
  cabinet_available: boolean;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

/**
 * Parse une heure HH:mm en minutes depuis minuit
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convertit des minutes depuis minuit en format HH:mm
 */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Génère les créneaux pour une plage horaire donnée
 */
function generateSlotsForRange(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  visioAvailable: boolean,
  cabinetAvailable: boolean
): Array<{
  time: string;
  visio_available: boolean;
  cabinet_available: boolean;
}> {
  const slots: Array<{
    time: string;
    visio_available: boolean;
    cabinet_available: boolean;
  }> = [];
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  let currentMinutes = startMinutes;
  while (currentMinutes + durationMinutes <= endMinutes) {
    slots.push({
      time: minutesToTime(currentMinutes),
      visio_available: visioAvailable,
      cabinet_available: cabinetAvailable,
    });
    currentMinutes += durationMinutes;
  }

  return slots;
}

/**
 * Génère les créneaux horaires pour une journée basé sur les disponibilités du nutritionniste
 */
function generateTimeSlotsForDay(
  date: Date,
  durationMinutes: number,
  bookedSlots: Set<string>,
  availabilities: AvailabilityRow[],
  blockedDates: Set<string>,
  exceptions: Map<string, AvailabilityRow[]>
): TimeSlot[] {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getUTCDay(); // 0 = dimanche, 1 = lundi, etc. (UTC)

  // Si la date est bloquée, aucun créneau
  if (blockedDates.has(dateStr)) {
    return [];
  }

  // Vérifier si c'est aujourd'hui et calculer l'heure minimum
  const now = new Date();
  const isToday =
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate();

  // Collecter tous les créneaux de la journée
  let daySlots: Array<{
    time: string;
    visio_available: boolean;
    cabinet_available: boolean;
  }> = [];

  // Vérifier s'il y a des exceptions pour cette date
  const dateExceptions = exceptions.get(dateStr);
  if (dateExceptions && dateExceptions.length > 0) {
    // Utiliser les exceptions au lieu des disponibilités récurrentes
    for (const exc of dateExceptions) {
      const excSlots = generateSlotsForRange(
        exc.start_time,
        exc.end_time,
        durationMinutes,
        exc.visio_available,
        exc.cabinet_available
      );
      daySlots.push(...excSlots);
    }
  } else {
    // Utiliser les disponibilités récurrentes
    const recurringForDay = availabilities.filter(
      a =>
        a.availability_type === 'recurring' &&
        a.day_of_week === dayOfWeek &&
        a.is_active &&
        (!a.valid_from || dateStr >= a.valid_from) &&
        (!a.valid_until || dateStr <= a.valid_until)
    );

    for (const avail of recurringForDay) {
      const slots = generateSlotsForRange(
        avail.start_time,
        avail.end_time,
        durationMinutes,
        avail.visio_available,
        avail.cabinet_available
      );
      daySlots.push(...slots);
    }
  }

  // Supprimer les doublons et trier
  const uniqueSlots = new Map<
    string,
    { time: string; visio_available: boolean; cabinet_available: boolean }
  >();
  for (const slot of daySlots) {
    if (!uniqueSlots.has(slot.time)) {
      uniqueSlots.set(slot.time, slot);
    } else {
      // Merger les disponibilités (OR logic)
      const existing = uniqueSlots.get(slot.time)!;
      uniqueSlots.set(slot.time, {
        time: slot.time,
        visio_available: existing.visio_available || slot.visio_available,
        cabinet_available: existing.cabinet_available || slot.cabinet_available,
      });
    }
  }

  const sortedSlots = Array.from(uniqueSlots.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  // Convertir en TimeSlot avec vérification disponibilité
  return sortedSlots.map(slot => {
    const slotKey = `${dateStr}_${slot.time}`;
    const isBooked = bookedSlots.has(slotKey);

    // Vérifier si le créneau est dans le passé (pour aujourd'hui)
    let isPast = false;
    if (isToday) {
      const [hours, minutes] = slot.time.split(':').map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours, minutes, 0, 0);
      // Marge de 2 heures pour les réservations
      isPast = slotDate.getTime() < now.getTime() + 2 * 60 * 60 * 1000;
    }

    const isAvailable = !isBooked && !isPast;

    return {
      time: slot.time,
      available: isAvailable,
      visio_available: isAvailable && slot.visio_available,
      cabinet_available: isAvailable && slot.cabinet_available,
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser les query params
    const { searchParams } = new URL(req.url);
    let nutritionistId = searchParams.get('nutritionist_id');
    const consultationTypeId = searchParams.get('consultation_type_id');
    const startDateStr = searchParams.get('start_date');
    const endDateStr = searchParams.get('end_date');
    const specificDateStr = searchParams.get('date'); // Pour une date spécifique

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Si nutritionist_id n'est pas fourni, le déduire du rôle de l'utilisateur
    if (!nutritionistId) {
      // Déterminer le rôle de l'utilisateur
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', auth.user.id)
        .single();

      const userRole = profile?.role || 'patient';

      if (userRole === 'nutritionist') {
        // Nutritionniste : récupérer son propre profil nutritionniste
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: nutriProfile, error: nutriError } = await (
          supabase as any
        )
          .from('nutritionist_profiles')
          .select('id')
          .eq('user_id', auth.user.id)
          .single();

        if (nutriError || !nutriProfile) {
          return apiResponse.error('Profil nutritionniste non trouvé', 404);
        }

        nutritionistId = nutriProfile.id;
      } else {
        // Patient : récupérer le nutritionniste assigné
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: patientProfile, error: profileError } = await (
          supabase as any
        )
          .from('patient_profiles')
          .select('nutritionist_id')
          .eq('user_id', auth.user.id)
          .single();

        if (profileError || !patientProfile) {
          return apiResponse.error('Profil patient non trouvé', 404);
        }

        nutritionistId = patientProfile.nutritionist_id;

        if (!nutritionistId) {
          return apiResponse.error(
            'Aucun nutritionniste assigné. Veuillez contacter le support.',
            400
          );
        }
      }
    }

    // 5. Récupérer la durée de la consultation (si type fourni)
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

    // 6. Déterminer la plage de dates
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

    // 6. Récupérer les disponibilités du nutritionniste depuis la base
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: availabilities, error: availError } = await (supabase as any)
      .from('nutritionist_availability')
      .select('*')
      .eq('nutritionist_id', nutritionistId)
      .eq('is_active', true);

    if (availError) {
      console.error('Error fetching nutritionist availability:', availError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des disponibilités'
      );
    }

    // Traiter les disponibilités
    const allAvailabilities = (availabilities || []) as AvailabilityRow[];

    // Filtrer par consultation_type_id si fourni :
    // - Garder les dispos avec consultation_type_id = null (tous les types)
    // - Garder les dispos avec consultation_type_id correspondant au type demandé
    // - Toujours garder les blocked (pas de consultation_type_id)
    const typedAvailabilities = consultationTypeId
      ? allAvailabilities.filter(
          a =>
            a.availability_type === 'blocked' ||
            a.consultation_type_id === null ||
            a.consultation_type_id === consultationTypeId
        )
      : allAvailabilities;

    // Séparer les blocages et exceptions
    const blockedDates = new Set<string>();
    const exceptions = new Map<string, AvailabilityRow[]>();

    for (const avail of typedAvailabilities) {
      if (avail.availability_type === 'blocked' && avail.specific_date) {
        blockedDates.add(avail.specific_date);
      } else if (
        avail.availability_type === 'exception' &&
        avail.specific_date
      ) {
        if (!exceptions.has(avail.specific_date)) {
          exceptions.set(avail.specific_date, []);
        }
        exceptions.get(avail.specific_date)!.push(avail);
      }
    }

    // 7. Récupérer les RDV existants du nutritionniste sur cette période
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAppointments, error: queryError } = await (
      supabase as any
    )
      .from('appointments')
      .select('scheduled_at, scheduled_end_at, duration')
      .eq('nutritionist_id', nutritionistId)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', startDate.toISOString().split('T')[0])
      .lte('scheduled_at', endDate.toISOString().split('T')[0] + 'T23:59:59Z');

    if (queryError) {
      console.error('Error fetching existing appointments:', queryError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des rendez-vous'
      );
    }

    // 8. Créer un Set des créneaux déjà réservés
    const bookedSlots = new Set<string>();
    if (existingAppointments) {
      for (const apt of existingAppointments) {
        const aptDate = new Date(apt.scheduled_at);
        const dateKey = aptDate.toISOString().split('T')[0];
        // Extraire l'heure en UTC puis convertir
        const hours = aptDate.getUTCHours().toString().padStart(2, '0');
        const minutes = aptDate.getUTCMinutes().toString().padStart(2, '0');
        const timeKey = `${hours}:${minutes}`;
        bookedSlots.add(`${dateKey}_${timeKey}`);
      }
    }

    // 9. Générer les créneaux pour chaque jour (en UTC pour éviter les bugs DST)
    const days: DaySlots[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayNumber = currentDate.getUTCDate();
      const dayName = currentDate.toLocaleDateString('fr-FR', {
        weekday: 'short',
        timeZone: 'UTC',
      });
      const monthName = currentDate.toLocaleDateString('fr-FR', {
        month: 'short',
        timeZone: 'UTC',
      });

      const slots = generateTimeSlotsForDay(
        new Date(currentDate),
        consultationDuration,
        bookedSlots,
        typedAvailabilities,
        blockedDates,
        exceptions
      );

      const availableSlots = slots.filter(s => s.available);

      days.push({
        date: dateStr,
        dayNumber,
        dayName,
        monthName,
        isAvailable: availableSlots.length > 0,
        slots,
        slotsCount: availableSlots.length,
      });

      // Incrémenter en UTC pour éviter les problèmes de changement d'heure (DST)
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // 10. Si date spécifique, retourner uniquement les slots de ce jour
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

    // 11. Retourner tous les jours avec leurs slots
    return NextResponse.json(
      {
        days,
        total_days: days.length,
        days_with_availability: days.filter(d => d.isAvailable).length,
        consultation_duration: consultationDuration,
        has_availability_config: typedAvailabilities.some(
          a => a.availability_type === 'recurring'
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/appointments/available-slots:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
