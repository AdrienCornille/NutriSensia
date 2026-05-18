import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/nutritionist/recipes/stats
 * Recipe engagement statistics for the nutritionist
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;
    // Admin client to bypass RLS for cross-user stats (recipe_history, recipe_favorites, recipe_ratings)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    // Get all recipes for this nutritionist
    const { data: recipes, error: recipesError } = await s
      .from('recipes')
      .select(
        'id, title, slug, image_url, status, average_rating, rating_count, published_at'
      )
      .eq('created_by', auth.user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (recipesError) {
      console.error('Error fetching recipes for stats:', recipesError);
    }

    if (!recipes || recipes.length === 0) {
      return apiResponse.success({
        totalRecipes: 0,
        publishedRecipes: 0,
        totalViews: 0,
        totalFavorites: 0,
        averageRating: 0,
        totalRatings: 0,
        totalCooked: 0,
        mostPopular: [],
        bestRated: [],
      });
    }

    const recipeIds = recipes.map((r: { id: string }) => r.id);

    // Count views from recipe_history (admin to bypass RLS)
    const { count: viewCount } = await admin
      .from('recipe_history')
      .select('id', { count: 'exact', head: true })
      .in('recipe_id', recipeIds)
      .eq('action_type', 'viewed');

    // Count favorites from recipe_favorites (admin to bypass RLS)
    const { count: favCount } = await admin
      .from('recipe_favorites')
      .select('id', { count: 'exact', head: true })
      .in('recipe_id', recipeIds);

    // Count "cooked" actions from recipe_history
    const { count: cookedCount } = await admin
      .from('recipe_history')
      .select('id', { count: 'exact', head: true })
      .in('recipe_id', recipeIds)
      .eq('action_type', 'cooked');

    // Get real ratings from recipe_ratings (RLS allows SELECT for all)
    const { data: allRatings } = await admin
      .from('recipe_ratings')
      .select('recipe_id, rating')
      .in('recipe_id', recipeIds);

    // Build per-recipe rating stats
    const ratingsByRecipe: Record<string, number[]> = {};
    for (const r of (allRatings || []) as {
      recipe_id: string;
      rating: number;
    }[]) {
      if (!ratingsByRecipe[r.recipe_id]) ratingsByRecipe[r.recipe_id] = [];
      ratingsByRecipe[r.recipe_id].push(r.rating);
    }
    const totalRatings = (allRatings || []).length;
    const ratingSum = (allRatings || []).reduce(
      (sum: number, r: { rating: number }) => sum + r.rating,
      0
    );

    // Views per recipe for "most popular"
    const { data: viewsByRecipe } = await admin
      .from('recipe_history')
      .select('recipe_id')
      .in('recipe_id', recipeIds)
      .eq('action_type', 'viewed');

    const viewCountByRecipe: Record<string, number> = {};
    for (const v of (viewsByRecipe || []) as { recipe_id: string }[]) {
      viewCountByRecipe[v.recipe_id] =
        (viewCountByRecipe[v.recipe_id] || 0) + 1;
    }

    // Most popular (by views)
    const mostPopular = [...recipes]
      .filter((r: { status: string }) => r.status === 'published')
      .sort(
        (a: { id: string }, b: { id: string }) =>
          (viewCountByRecipe[b.id] || 0) - (viewCountByRecipe[a.id] || 0)
      )
      .slice(0, 10)
      .map((r: { id: string; title: string; image_url: string | null }) => ({
        id: r.id,
        title: r.title,
        views: viewCountByRecipe[r.id] || 0,
        image_url: r.image_url,
      }));

    // Best rated (from real ratings)
    const bestRated = [...recipes]
      .filter((r: { id: string }) => ratingsByRecipe[r.id]?.length > 0)
      .sort((a: { id: string }, b: { id: string }) => {
        const avgA =
          ratingsByRecipe[a.id].reduce((s, v) => s + v, 0) /
          ratingsByRecipe[a.id].length;
        const avgB =
          ratingsByRecipe[b.id].reduce((s, v) => s + v, 0) /
          ratingsByRecipe[b.id].length;
        return avgB - avgA;
      })
      .slice(0, 10)
      .map((r: { id: string; title: string; image_url: string | null }) => {
        const ratings = ratingsByRecipe[r.id];
        const avg = ratings.reduce((s, v) => s + v, 0) / ratings.length;
        return {
          id: r.id,
          title: r.title,
          rating: Math.round(avg * 100) / 100,
          ratingCount: ratings.length,
          image_url: r.image_url,
        };
      });

    const publishedCount = recipes.filter(
      (r: { status: string }) => r.status === 'published'
    ).length;

    return apiResponse.success({
      totalRecipes: recipes.length,
      publishedRecipes: publishedCount,
      totalViews: viewCount || 0,
      totalFavorites: favCount || 0,
      averageRating:
        totalRatings > 0
          ? Math.round((ratingSum / totalRatings) * 100) / 100
          : 0,
      totalRatings,
      totalCooked: cookedCount || 0,
      mostPopular,
      bestRated,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
