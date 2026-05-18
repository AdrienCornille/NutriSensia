import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { TAG_GROUP_CONFIG, AUTO_TAG_LABELS } from '@/lib/recipe-auto-tags';

/**
 * GET /api/protected/recipes/tags
 * Returns all active tag groups (manual + auto-computed) for filter UIs.
 * Phase 1 only — 'diet' and 'allergen' groups are excluded.
 */
export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // ── Manual tag groups ──
    // Fetch all active tags, grouped by tag_type
    const { data: manualTags, error: tagsError } = await s
      .from('recipe_tags')
      .select('id, name_fr, slug, tag_type, color, icon')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return apiResponse.serverError('Erreur lors de la récupération des tags');
    }

    // Group manual tags by tag_type
    const manualGroupMap: Record<
      string,
      {
        id: string;
        name_fr: string;
        slug: string;
        color: string | null;
        icon: string | null;
      }[]
    > = {};
    for (const tag of manualTags || []) {
      if (!manualGroupMap[tag.tag_type]) {
        manualGroupMap[tag.tag_type] = [];
      }
      manualGroupMap[tag.tag_type].push({
        id: tag.id,
        name_fr: tag.name_fr,
        slug: tag.slug,
        color: tag.color,
        icon: tag.icon,
      });
    }

    // Build manual groups with config metadata, Phase 1 only, exclude auto-computed
    const phase1Manual = TAG_GROUP_CONFIG.filter(
      g => g.phase === 1 && !g.autoComputed
    );
    const groups = phase1Manual
      .filter(g => manualGroupMap[g.slug])
      .map(g => ({
        slug: g.slug,
        label: g.label,
        color: g.color,
        tags: manualGroupMap[g.slug],
      }));

    // ── Auto-computed tag groups ──
    // Query distinct values with counts from recipe_auto_tags
    const { data: autoTagRows, error: autoError } = await s
      .from('recipe_auto_tags')
      .select('tag_group, tag_value');

    if (autoError) {
      console.error('Error fetching auto tags:', autoError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des auto-tags'
      );
    }

    // Count occurrences per group/value
    const autoCountMap: Record<string, Record<string, number>> = {};
    for (const row of autoTagRows || []) {
      if (!autoCountMap[row.tag_group]) {
        autoCountMap[row.tag_group] = {};
      }
      autoCountMap[row.tag_group][row.tag_value] =
        (autoCountMap[row.tag_group][row.tag_value] || 0) + 1;
    }

    // Build auto groups with config metadata, Phase 1 only
    const phase1Auto = TAG_GROUP_CONFIG.filter(
      g => g.phase === 1 && g.autoComputed
    );
    const autoGroups = phase1Auto.map(g => ({
      slug: g.slug,
      label: g.label,
      color: g.color,
      values: Object.entries(autoCountMap[g.slug] || {}).map(
        ([value, count]) => ({
          value,
          label: AUTO_TAG_LABELS[value] || value,
          count,
        })
      ),
    }));

    return apiResponse.success({ groups, autoGroups });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
