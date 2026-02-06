/**
 * API Routes pour le suivi du poids
 * Endpoints: POST (enregistrer pesée), GET (historique)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { apiResponse } from '@/lib/api-auth';
import { createWeightEntrySchema } from '@/lib/api-schemas';

// ============================================================================
// POST - Enregistrer une nouvelle pesée
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
      validatedData = createWeightEntrySchema.parse(body);
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

    // 5. Vérifier qu'il n'existe pas déjà une pesée pour cette date
    const { data: existingEntry } = await supabase
      .from('weight_entries')
      .select('id, weight_kg')
      .eq('user_id', auth.user.id)
      .eq('date', entryDate)
      .single();

    if (existingEntry) {
      return apiResponse.error(
        "Une pesée existe déjà pour cette date. Vous ne pouvez enregistrer qu'une seule pesée par jour.",
        409 // Conflict
      );
    }

    // 6. Insérer la nouvelle pesée
    const { data: newEntry, error: insertError } = await supabase
      .from('weight_entries')
      .insert({
        user_id: auth.user.id,
        weight_kg: validatedData.weight_kg,
        date: entryDate,
        notes: validatedData.notes,
        source: 'manual',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating weight entry:', insertError);

      // Gérer l'erreur de contrainte UNIQUE (au cas où la vérification précédente a raté)
      if (insertError.code === '23505') {
        // Violation de contrainte unique
        return apiResponse.error(
          "Une pesée existe déjà pour cette date. Vous ne pouvez enregistrer qu'une seule pesée par jour.",
          409
        );
      }

      return apiResponse.serverError('Erreur lors de la création de la pesée');
    }

    // 7. Récupérer la pesée précédente pour calculer la variation
    const { data: previousWeight } = await supabase
      .from('weight_entries')
      .select('weight_kg, date')
      .eq('user_id', auth.user.id)
      .lt('date', entryDate)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // 8. Calculer la variation
    const variation_kg = previousWeight
      ? Number((newEntry.weight_kg - previousWeight.weight_kg).toFixed(2))
      : 0;

    // 9. Retourner la pesée créée avec variation calculée
    return NextResponse.json(
      {
        ...newEntry,
        variation_kg,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/biometrics/weight:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// GET - Récupérer l'historique des pesées
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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = searchParams.get('limit');

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Construire requête
    let query = supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('date', { ascending: false });

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

    const { data: entries, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching weight entries:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des données'
      );
    }

    // 5. Calculer les variations pour chaque entrée
    const entriesWithVariation = entries.map((entry, index) => {
      // Trouver l'entrée précédente
      const previousEntry = entries[index + 1];
      const variation_kg = previousEntry
        ? Number((entry.weight_kg - previousEntry.weight_kg).toFixed(2))
        : 0;

      return {
        ...entry,
        variation_kg,
      };
    });

    // 6. Récupérer l'objectif de poids actuel
    const { data: goal } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('is_achieved', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 7. Calculer statistiques
    const statistics = {
      current_weight: entries.length > 0 ? entries[0].weight_kg : null,
      goal_weight: goal?.target_weight_kg || null,
      initial_weight:
        goal?.initial_weight_kg ||
        (entries.length > 0 ? entries[entries.length - 1].weight_kg : null),
      total_change:
        entries.length > 0
          ? Number(
              (
                entries[0].weight_kg - entries[entries.length - 1].weight_kg
              ).toFixed(2)
            )
          : 0,
      entries_count: entries.length,
    };

    // 8. Retourner données avec statistiques
    return NextResponse.json(
      {
        entries: entriesWithVariation,
        statistics,
        goal,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/biometrics/weight:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
