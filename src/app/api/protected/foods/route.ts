import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { z } from 'zod';
import { decodeHtmlEntities } from '@/lib/utils';

const VALID_ALLERGENS = [
  'gluten',
  'lactose',
  'oeuf',
  'arachide',
  'fruits-a-coque',
  'poisson-crustace',
  'soja',
] as const;

/**
 * GET /api/protected/foods
 * List foods with search, category filter, sorting, pagination
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const categorySlug = searchParams.get('category');
    const sort = searchParams.get('sort') || 'name-asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      100
    );
    const offset = (page - 1) * limit;

    // Base query
    let query = s
      .from('foods')
      .select(
        'id, name_fr, brand, calories, proteins, carbohydrates, fat, fiber, image_url, category_id, data_source, food_categories!category_id(slug, name_fr, icon)',
        { count: 'exact' }
      )
      .eq('is_active', true);

    // Search
    if (search && search.trim().length >= 2) {
      query = query.or(
        `name_fr.ilike.%${search.trim()}%,brand.ilike.%${search.trim()}%`
      );
    }

    // Category filter (include children if parent selected)
    if (categorySlug) {
      const { data: cat } = await s
        .from('food_categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();
      if (cat) {
        // Get child category IDs too
        const { data: children } = await s
          .from('food_categories')
          .select('id')
          .eq('parent_id', cat.id);
        const categoryIds = [
          cat.id,
          ...(children || []).map((c: { id: string }) => c.id),
        ];
        query = query.in('category_id', categoryIds);
      }
    }

    // Sorting
    const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
      'name-asc': { column: 'name_fr', ascending: true },
      'name-desc': { column: 'name_fr', ascending: false },
      'calories-asc': { column: 'calories', ascending: true },
      'calories-desc': { column: 'calories', ascending: false },
      'protein-asc': { column: 'proteins', ascending: true },
      'protein-desc': { column: 'proteins', ascending: false },
      'carbs-asc': { column: 'carbohydrates', ascending: true },
      'carbs-desc': { column: 'carbohydrates', ascending: false },
      'fat-asc': { column: 'fat', ascending: true },
      'fat-desc': { column: 'fat', ascending: false },
      'fiber-asc': { column: 'fiber', ascending: true },
      'fiber-desc': { column: 'fiber', ascending: false },
    };
    const sortConfig = SORT_MAP[sort] || SORT_MAP['name-asc'];
    if (sortConfig) {
      query = query.order(sortConfig.column, {
        ascending: sortConfig.ascending,
        nullsFirst: false,
      });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: foods, error, count } = await query;

    if (error) {
      console.error('Error fetching foods:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des aliments'
      );
    }

    // Get user's favorites
    const foodIds = (foods || []).map((f: { id: string }) => f.id);
    let favoriteIds = new Set<string>();
    if (foodIds.length > 0) {
      const { data: favs } = await s
        .from('food_favorites')
        .select('food_id')
        .eq('user_id', auth.user.id)
        .in('food_id', foodIds);
      favoriteIds = new Set(
        (favs || []).map((f: { food_id: string }) => f.food_id)
      );
    }

    const formattedFoods = (foods || []).map(
      (f: {
        id: string;
        name_fr: string;
        brand: string | null;
        calories: number | null;
        proteins: number | null;
        carbohydrates: number | null;
        fat: number | null;
        fiber: number | null;
        image_url: string | null;
        data_source: string | null;
        food_categories: {
          slug: string;
          name_fr: string;
          icon: string | null;
        } | null;
      }) => ({
        id: f.id,
        name: decodeHtmlEntities(f.name_fr),
        brand: f.brand,
        category: f.food_categories?.slug || 'other',
        categoryLabel: f.food_categories?.name_fr || 'Autre',
        categoryEmoji: f.food_categories?.icon || '📦',
        calories: f.calories || 0,
        protein: f.proteins || 0,
        carbs: f.carbohydrates || 0,
        fat: f.fat || 0,
        fiber: f.fiber || 0,
        image: f.image_url || '',
        per: '100g',
        source: f.data_source,
        isFavorite: favoriteIds.has(f.id),
      })
    );

    // Get categories with hierarchy
    const { data: categories } = await s
      .from('food_categories')
      .select('id, slug, name_fr, icon, parent_id, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Emoji fallback map for categories without icons in DB
    const EMOJI_MAP: Record<string, string> = {
      fruits: '🍎',
      vegetables: '🥬',
      legumes: '🥬',
      grains: '🌾',
      proteins: '🍗',
      dairy: '🥛',
      'fats-oils': '🫒',
      sweets: '🍫',
      beverages: '🥤',
      condiments: '🧂',
      prepared: '🍱',
      meat: '🥩',
      poultry: '🍗',
      fish: '🐟',
      seafood: '🦐',
      eggs: '🥚',
      'legumes-secs': '🫘',
      // Sous-catégories CIQUAL
      soupes: '🍲',
      sandwichs: '🥪',
      pizzas: '🍕',
      salades: '🥗',
      'plats-composes': '🍛',
      'pates-riz': '🍝',
      pains: '🍞',
      'biscuits-aperitifs': '🍘',
      farines: '🌾',
      'pates-a-tarte': '🥧',
      'viandes-cuites': '🥩',
      'viandes-crues': '🥩',
      charcuteries: '🥓',
      'poissons-cuits': '🐟',
      'poissons-crus': '🐟',
      'mollusques-crustaces-cuits': '🦪',
      'mollusques-crustaces-crus': '🦐',
      oeufs: '🥚',
      laits: '🥛',
      fromages: '🧀',
      'produits-laitiers-frais': '🧈',
      cremes: '🍦',
      eaux: '💧',
      'boissons-sans-alcool': '🧃',
      'boisson-alcoolisees': '🍷',
      'sucres-miels': '🍯',
      chocolats: '🍫',
      confiseries: '🍬',
      confitures: '🍓',
      viennoiseries: '🥐',
      'biscuits-sucres': '🍪',
      'cereales-petit-dejeuner': '🥣',
      'barres-cerealieres': '🧇',
      'gateaux-patisseries': '🎂',
      glaces: '🍦',
      sorbets: '🍧',
      'desserts-glaces': '🍨',
      beurres: '🧈',
      'huiles-graisses-vegetales': '🫒',
      margarines: '🧈',
      'huiles-poissons': '🐟',
      'autres-matieres-grasses': '🫒',
      sauces: '🫙',
      sels: '🧂',
      epices: '🌶️',
      herbes: '🌿',
      algues: '🌊',
      'aides-culinaires': '🧑‍🍳',
      'fruits-coque': '🥜',
      'pommes-terre': '🥔',
      'feuilletees-entrees': '🥟',
      'produits-mer': '🦀',
      'alternatives-vegetales': '🌱',
      'ingredients-vegetariens': '🥦',
      'tartinables-vegetariens': '🫘',
      'petits-pots-infantiles': '👶',
      'desserts-infantiles': '👶',
      'cereales-biscuits-infantiles': '👶',
      'laits-boissons-infantiles': '🍼',
      'denrees-alimentation-particuliere': '⚕️',
    };

    function resolveEmoji(slug: string, icon: string | null): string {
      if (icon) return icon;
      // Direct match
      if (EMOJI_MAP[slug]) return EMOJI_MAP[slug];
      // Partial match
      for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
        if (slug.includes(key) || key.includes(slug)) return emoji;
      }
      return '🍽️';
    }

    // Build hierarchical categories
    const allCats = (categories || []) as {
      id: string;
      slug: string;
      name_fr: string;
      icon: string | null;
      parent_id: string | null;
      sort_order: number;
    }[];
    const parentCats = allCats.filter(c => !c.parent_id);
    const hierarchicalCategories = parentCats.map(parent => ({
      slug: parent.slug,
      label: parent.name_fr,
      emoji: resolveEmoji(parent.slug, parent.icon),
      children: allCats
        .filter(c => c.parent_id === parent.id)
        .map(child => ({
          slug: child.slug,
          label: child.name_fr,
          emoji: resolveEmoji(child.slug, child.icon),
        })),
    }));

    return apiResponse.success({
      foods: formattedFoods,
      categories: hierarchicalCategories,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

const createFoodSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200),
  origin_type: z.enum([
    'animal',
    'dairy',
    'egg',
    'fish',
    'seafood',
    'plant',
    'mixed',
  ]),
  allergens: z.array(z.enum(VALID_ALLERGENS)).default([]),
  calories: z.number().min(0).max(9999),
  proteins: z.number().min(0).max(999),
  carbohydrates: z.number().min(0).max(999),
  fat: z.number().min(0).max(999),
  fiber: z.number().min(0).max(999).optional().nullable(),
});

/**
 * POST /api/protected/foods
 * Create a custom food item (nutritionist or patient)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const body = await req.json();
    const parsed = createFoodSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const {
      name,
      origin_type,
      allergens: userAllergens,
      calories,
      proteins,
      carbohydrates,
      fat,
      fiber,
    } = parsed.data;

    // Use allergens from the form (user-confirmed), enrich with origin-implied allergens
    const allergens = [...userAllergens];
    if (
      ['fish', 'seafood'].includes(origin_type) &&
      !allergens.includes('poisson-crustace')
    ) {
      allergens.push('poisson-crustace');
    }
    if (origin_type === 'egg' && !allergens.includes('oeuf')) {
      allergens.push('oeuf');
    }
    if (origin_type === 'dairy' && !allergens.includes('lactose')) {
      allergens.push('lactose');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { data: food, error } = await s
      .from('foods')
      .insert({
        name_fr: name,
        calories,
        proteins,
        carbohydrates,
        fat,
        fiber: fiber ?? null,
        origin_type,
        allergens,
        is_custom: true,
        is_active: true,
        created_by: auth.user.id,
        data_source: 'nutritionist',
        data_quality: 'medium',
      })
      .select('id, name_fr, calories, proteins, carbohydrates, fat, fiber')
      .single();

    if (error) {
      console.error('Error creating food:', error);
      return apiResponse.serverError("Erreur lors de la création de l'aliment");
    }

    return apiResponse.success(
      {
        id: food.id,
        name: food.name_fr,
        calories_per_100g: food.calories,
        protein_per_100g: food.proteins,
        carbs_per_100g: food.carbohydrates,
        fat_per_100g: food.fat,
        fiber_per_100g: food.fiber,
      },
      201
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
