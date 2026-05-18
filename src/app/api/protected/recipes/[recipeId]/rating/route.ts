import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { recipeRatingSchema } from '@/lib/api-schemas';

/**
 * GET /api/protected/recipes/[recipeId]/rating
 * Get the current user's rating for this recipe
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { recipeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { data: rating } = await s
      .from('recipe_ratings')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    return apiResponse.success({ rating: rating || null });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/recipes/[recipeId]/rating
 * Create or update the user's rating
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { recipeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const body = await req.json();
    const parsed = recipeRatingSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Upsert rating
    const { data: existing } = await s
      .from('recipe_ratings')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    let rating;
    if (existing) {
      const { data, error } = await s
        .from('recipe_ratings')
        .update({
          rating: parsed.data.rating,
          comment: parsed.data.comment || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating rating:', error);
        return apiResponse.serverError('Erreur lors de la mise à jour');
      }
      rating = data;
    } else {
      const { data, error } = await s
        .from('recipe_ratings')
        .insert({
          user_id: auth.user.id,
          recipe_id: recipeId,
          rating: parsed.data.rating,
          comment: parsed.data.comment || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rating:', error);
        return apiResponse.serverError("Erreur lors de l'enregistrement");
      }
      rating = data;
    }

    // The DB trigger auto-updates average_rating on recipes table

    return apiResponse.success({ rating });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
