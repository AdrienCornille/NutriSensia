/**
 * API Route: /api/protected/foods/[id]/units
 * Retourne les unités disponibles avec leur gram_equivalent pour un aliment
 *
 * GET - Liste les unités (food-specific + category fallback + grammes par défaut)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: foodId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Get food's category_id
    const { data: food } = await s
      .from('foods')
      .select('id, category_id')
      .eq('id', foodId)
      .single();

    if (!food) {
      return apiResponse.error('Aliment introuvable', 404);
    }

    // Fetch food-specific and category-level conversions in parallel
    const [{ data: foodConversions }, { data: categoryConversions }] = await Promise.all([
      s.from('food_unit_conversions')
        .select('unit, label, gram_equivalent')
        .eq('food_id', foodId)
        .order('unit'),
      food.category_id
        ? s.from('food_unit_conversions')
            .select('unit, label, gram_equivalent')
            .eq('food_category_id', food.category_id)
            .is('food_id', null)
            .order('unit')
        : Promise.resolve({ data: [] }),
    ]);

    // Merge: food-specific takes priority over category-level
    const unitMap = new Map<string, { unit: string; label: string; gram_equivalent: number }>();

    // Add category-level first (lower priority)
    for (const conv of categoryConversions || []) {
      unitMap.set(conv.unit, {
        unit: conv.unit,
        label: conv.label,
        gram_equivalent: Number(conv.gram_equivalent),
      });
    }

    // Override with food-specific (higher priority)
    for (const conv of foodConversions || []) {
      unitMap.set(conv.unit, {
        unit: conv.unit,
        label: conv.label,
        gram_equivalent: Number(conv.gram_equivalent),
      });
    }

    // Always include 'g' as default
    const units = [
      { unit: 'g', label: 'grammes', gram_equivalent: 1 },
      ...Array.from(unitMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ];

    return apiResponse.success({ units });
  } catch (error) {
    console.error('Unexpected error in food units GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
