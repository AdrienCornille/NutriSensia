/**
 * API Route pour les badges du patient
 * GET - Récupérer les badges déverrouillés et en progression
 */

import { NextResponse } from 'next/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();

    // Récupérer tous les badges actifs
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select(`
        id, code, name_fr, name_en, description_fr, description_en,
        level, icon, emoji, image_url, color, points,
        unlock_conditions, rarity_percent, is_secret,
        category_id,
        badge_categories (slug, name_fr, icon, color)
      `)
      .eq('is_active', true)
      .order('points', { ascending: true });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return apiResponse.serverError('Erreur lors de la récupération des badges');
    }

    // Récupérer les badges du patient
    const { data: patientBadges, error: pbError } = await supabase
      .from('patient_badges')
      .select('badge_id, progress, progress_data, unlocked_at, is_featured')
      .eq('patient_id', auth.user.id);

    if (pbError) {
      console.error('Error fetching patient badges:', pbError);
      return apiResponse.serverError('Erreur lors de la récupération des badges patient');
    }

    const unlockedMap = new Map(
      (patientBadges || []).map(pb => [pb.badge_id, pb])
    );

    // Séparer badges déverrouillés et verrouillés
    const unlocked: any[] = [];
    const locked: any[] = [];

    for (const badge of allBadges || []) {
      const playerBadge = unlockedMap.get(badge.id);
      const category = (badge as any).badge_categories;

      const baseBadge = {
        id: badge.id,
        code: badge.code,
        name: badge.name_fr,
        description: badge.description_fr,
        level: badge.level,
        icon: badge.icon,
        emoji: badge.emoji,
        image_url: badge.image_url,
        color: badge.color,
        points: badge.points,
        category: category ? {
          slug: category.slug,
          name: category.name_fr,
          icon: category.icon,
          color: category.color,
        } : null,
      };

      if (playerBadge && playerBadge.progress >= 100) {
        unlocked.push({
          ...baseBadge,
          unlocked_at: playerBadge.unlocked_at,
          is_featured: playerBadge.is_featured,
        });
      } else if (!badge.is_secret || playerBadge) {
        // Montrer les badges non-secrets ou ceux dont on a commencé la progression
        locked.push({
          ...baseBadge,
          progress: playerBadge?.progress || 0,
          progress_data: playerBadge?.progress_data || null,
        });
      }
    }

    return NextResponse.json({
      badges: unlocked,
      locked_badges: locked,
      total_unlocked: unlocked.length,
      total_available: (allBadges || []).filter(b => !b.is_secret).length,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/gamification/badges:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
