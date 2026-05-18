import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/nutritionist/recipes/[recipeId]/reviews
 * Get all patient reviews for a recipe (nutritionist view)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { recipeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Verify recipe belongs to this nutritionist
    const { data: recipe } = await s
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .maybeSingle();

    if (!recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }

    const { data: reviews, error } = await s
      .from('recipe_ratings')
      .select(
        'id, user_id, rating, comment, created_at, updated_at, profiles!user_id(first_name, last_name)'
      )
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return apiResponse.serverError('Erreur lors de la récupération des avis');
    }

    const formatted = (reviews || []).map(
      (r: {
        id: string;
        user_id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        updated_at: string;
        profiles: { first_name: string; last_name: string } | null;
      }) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        author: r.profiles
          ? `${r.profiles.first_name} ${r.profiles.last_name?.charAt(0) || ''}.`
          : 'Anonyme',
      })
    );

    // Compute summary
    const count = formatted.length;
    const avg =
      count > 0
        ? Math.round(
            (formatted.reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0
            ) /
              count) *
              10
          ) / 10
        : 0;

    return apiResponse.success({
      reviews: formatted,
      summary: { average: avg, count },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
