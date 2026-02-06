/**
 * API Routes pour le suivi des mensurations
 * Endpoints: POST (créer mesure), GET (récupérer mesures)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { apiResponse } from '@/lib/api-auth';
import { createMeasurementEntrySchema } from '@/lib/api-schemas';
import { calculateMeasurementsStatistics } from '@/lib/measurements-transformers';

// ============================================================================
// POST - Créer une mesure corporelle
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Authentifier
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser et valider le body
    const body = await req.json();
    let validatedData;

    try {
      validatedData = createMeasurementEntrySchema.parse(body);
    } catch (error: any) {
      return apiResponse.error(
        `Données invalides: ${error.errors?.map((e: any) => e.message).join(', ')}`,
        400
      );
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Déterminer la date (utiliser measured_at si fourni, sinon aujourd'hui)
    let entryDate: string;
    if (validatedData.measured_at) {
      const measuredDate = new Date(validatedData.measured_at);
      entryDate = measuredDate.toISOString().split('T')[0]; // YYYY-MM-DD
    } else {
      const today = new Date();
      entryDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // 5. Vérifier qu'il n'existe pas déjà une mesure de ce type pour cette date
    const { data: existingEntry } = await supabase
      .from('measurements')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('measurement_type', validatedData.measurement_type)
      .eq('date', entryDate)
      .single();

    if (existingEntry) {
      return apiResponse.error(
        `Une mesure de type "${validatedData.measurement_type}" existe déjà pour cette date. Vous ne pouvez enregistrer qu'une seule mesure par type par jour.`,
        409 // Conflict
      );
    }

    // 6. Insérer la nouvelle mesure
    const { data: newEntry, error: insertError } = await supabase
      .from('measurements')
      .insert({
        user_id: auth.user.id,
        measurement_type: validatedData.measurement_type,
        value_cm: validatedData.value_cm,
        date: entryDate,
        notes: validatedData.notes,
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating measurement:', insertError);

      // Gérer l'erreur de contrainte UNIQUE (au cas où la vérification précédente a raté)
      if (insertError.code === '23505') {
        // Violation de contrainte unique
        return apiResponse.error(
          `Une mesure de ce type existe déjà pour cette date. Vous ne pouvez enregistrer qu'une seule mesure par type par jour.`,
          409
        );
      }

      return apiResponse.serverError('Erreur lors de la création de la mesure');
    }

    // 7. Retourner la mesure créée
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/biometrics/measurements:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// GET - Récupérer les mesures
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Authentifier
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser query params
    const { searchParams } = new URL(req.url);
    const measurementType = searchParams.get('measurement_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = searchParams.get('limit');

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Construire requête
    let query = supabase
      .from('measurements')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('date', { ascending: false });

    // Appliquer filtre par type
    if (measurementType) {
      query = query.eq('measurement_type', measurementType);
    }

    // Appliquer filtres de date
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    // Appliquer limite
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
        query = query.limit(limitNum);
      }
    }

    const { data: measurements, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching measurements:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des données'
      );
    }

    // 5. Calculer statistiques
    const statistics = calculateMeasurementsStatistics(measurements);

    // 6. Retourner données avec statistiques
    return NextResponse.json(
      {
        measurements,
        statistics,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/biometrics/measurements:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
