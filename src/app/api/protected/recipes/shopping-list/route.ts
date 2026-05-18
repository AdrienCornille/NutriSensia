import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { addRecipeToShoppingListSchema } from '@/lib/api-schemas';

const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  ml: 'ml',
  c_a_s: 'c. à soupe',
  c_a_c: 'c. à café',
  tasse: 'tasse',
  portion: 'portion',
  piece: 'pièce',
  pièce: 'pièce',
  kg: 'kg',
  l: 'L',
  cl: 'cl',
  dl: 'dl',
};

function formatUnit(unit: string | null | undefined): string {
  if (!unit) return 'g';
  return UNIT_LABELS[unit] || unit;
}

/**
 * GET /api/protected/recipes/shopping-list
 * Get the patient's active shopping list with items
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

    // Get active shopping list
    const { data: list } = await s
      .from('shopping_lists')
      .select('*, shopping_list_categories(*, shopping_list_items(*))')
      .eq('patient_id', auth.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!list) {
      return apiResponse.success({
        list: null,
        categories: [],
        progress: { total: 0, checked: 0, percentage: 0 },
      });
    }

    // Also get uncategorized items
    const { data: uncategorizedItems } = await s
      .from('shopping_list_items')
      .select('*')
      .eq('shopping_list_id', list.id)
      .is('category_id', null)
      .order('display_order', { ascending: true });

    // Sort categories
    const categories = (list.shopping_list_categories || [])
      .sort(
        (a: { display_order: number }, b: { display_order: number }) =>
          a.display_order - b.display_order
      )
      .map(
        (cat: { shopping_list_items?: unknown[]; [key: string]: unknown }) => ({
          ...cat,
          items: (
            (cat.shopping_list_items || []) as { display_order: number }[]
          ).sort((a, b) => a.display_order - b.display_order),
        })
      );

    // Add uncategorized items as a virtual category
    if (uncategorizedItems && uncategorizedItems.length > 0) {
      categories.push({
        id: '__uncategorized',
        name: 'Autres',
        icon: '📦',
        display_order: 999,
        items: uncategorizedItems,
      });
    }

    // Calculate progress
    let total = 0;
    let checked = 0;
    for (const cat of categories) {
      for (const item of cat.items || []) {
        total++;
        if ((item as { is_checked: boolean }).is_checked) checked++;
      }
    }

    return apiResponse.success({
      list: {
        id: list.id,
        name: list.name,
        week_start: list.week_start,
        week_end: list.week_end,
      },
      categories,
      progress: {
        total,
        checked,
        percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/recipes/shopping-list
 * Add a recipe's ingredients to the shopping list
 * Creates a new list if none exists
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const body = await req.json();
    const parsed = addRecipeToShoppingListSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { recipe_id, servings_multiplier, excluded_ingredient_ids } =
      parsed.data;

    // Fetch recipe with ingredients (include food category info)
    const { data: recipe, error: recipeError } = await s
      .from('recipes')
      .select(
        'id, title, servings, recipe_ingredients(*, foods!food_id(category_id, food_categories!category_id(slug, name_fr)))'
      )
      .eq('id', recipe_id)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (recipeError || !recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }

    // Get or create active shopping list
    let { data: list } = await s
      .from('shopping_lists')
      .select('id')
      .eq('patient_id', auth.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!list) {
      const { data: newList, error: listError } = await s
        .from('shopping_lists')
        .insert({
          patient_id: auth.user.id,
          name: 'Ma liste de courses',
          source_type: 'recipe',
        })
        .select()
        .single();

      if (listError || !newList) {
        console.error(
          'Error creating shopping list:',
          JSON.stringify(listError, null, 2)
        );
        return apiResponse.error(
          `Erreur lors de la création de la liste: ${listError?.message || listError?.code || 'unknown'}`,
          500
        );
      }
      list = newList;
    }

    // Default shopping list categories mapped from food_categories slugs
    const SHOPPING_CATEGORIES: {
      name: string;
      icon: string;
      order: number;
      slugs: string[];
    }[] = [
      {
        name: 'Fruits & Légumes',
        icon: '🥬',
        order: 1,
        slugs: ['fruits', 'legumes', 'vegetables'],
      },
      {
        name: 'Viandes & Volailles',
        icon: '🥩',
        order: 2,
        slugs: ['viandes', 'volailles'],
      },
      {
        name: 'Poissons & Fruits de mer',
        icon: '🐟',
        order: 3,
        slugs: ['poissons', 'fruits-de-mer'],
      },
      { name: 'Charcuterie', icon: '🥓', order: 4, slugs: [] },
      {
        name: 'Produits laitiers & Œufs',
        icon: '🧀',
        order: 5,
        slugs: ['produits-laitiers', 'dairy', 'oeufs'],
      },
      {
        name: 'Céréales & Féculents',
        icon: '🌾',
        order: 6,
        slugs: ['cereales', 'feculents', 'cereales-feculents'],
      },
      { name: 'Légumineuses', icon: '🫘', order: 7, slugs: ['legumineuses'] },
      {
        name: 'Matières grasses',
        icon: '🫒',
        order: 8,
        slugs: ['matieres-grasses', 'fats'],
      },
      {
        name: 'Condiments & Épices',
        icon: '🧂',
        order: 9,
        slugs: ['condiments', 'epices', 'condiments-epices'],
      },
      {
        name: 'Boissons',
        icon: '🥤',
        order: 10,
        slugs: ['boissons', 'beverages'],
      },
      { name: 'Autres', icon: '📦', order: 99, slugs: [] },
    ];

    // Get or create all categories for this list
    const { data: existingCats } = await s
      .from('shopping_list_categories')
      .select('id, name')
      .eq('shopping_list_id', list.id);

    const catMap = new Map<string, string>(); // category name → id
    for (const cat of existingCats || []) {
      catMap.set(cat.name, cat.id);
    }

    // Create missing categories
    const missingCats = SHOPPING_CATEGORIES.filter(c => !catMap.has(c.name));
    if (missingCats.length > 0) {
      const { data: newCats } = await s
        .from('shopping_list_categories')
        .insert(
          missingCats.map(c => ({
            shopping_list_id: list.id,
            name: c.name,
            icon: c.icon,
            display_order: c.order,
          }))
        )
        .select('id, name');

      for (const cat of newCats || []) {
        catMap.set(cat.name, cat.id);
      }
    }

    // Build slug → shopping category name lookup
    const slugToCatName = new Map<string, string>();
    for (const cat of SHOPPING_CATEGORIES) {
      for (const slug of cat.slugs) {
        slugToCatName.set(slug, cat.name);
      }
    }

    // Keyword-based fallback to categorize ingredients by name
    const KEYWORD_CATEGORIES: { category: string; keywords: string[] }[] = [
      {
        category: 'Fruits & Légumes',
        keywords: [
          'tomate',
          'carotte',
          'oignon',
          'ail',
          'poivron',
          'courgette',
          'aubergine',
          'brocoli',
          'chou',
          'épinard',
          'salade',
          'laitue',
          'concombre',
          'céleri',
          'poireau',
          'navet',
          'betterave',
          'radis',
          'artichaut',
          'asperge',
          'fenouil',
          'champignon',
          'avocat',
          'pomme de terre',
          'patate',
          'haricot vert',
          'petit pois',
          'maïs',
          'olive',
          'cornichon',
          'piment',
          'piquillos',
          'pomme',
          'banane',
          'orange',
          'citron',
          'fraise',
          'framboise',
          'myrtille',
          'mangue',
          'ananas',
          'poire',
          'pêche',
          'abricot',
          'cerise',
          'raisin',
          'melon',
          'pastèque',
          'kiwi',
          'figue',
          'grenade',
          'fruit',
          'légume',
          'coriandre fraîche',
          'persil',
          'basilic',
          'menthe',
          'ciboulette',
          'échalote',
          'gingembre',
          'courge',
          'butternut',
          'potiron',
          'endive',
        ],
      },
      {
        category: 'Viandes & Volailles',
        keywords: [
          'poulet',
          'bœuf',
          'boeuf',
          'porc',
          'veau',
          'agneau',
          'dinde',
          'canard',
          'steak',
          'escalope',
          'cuisse',
          'blanc de',
          'viande',
          'rôti',
          'côte',
          'entrecôte',
          'bavette',
          'rumsteck',
          'gigot',
          'souris',
          'tofu',
          'tempeh',
          'seitan',
        ],
      },
      {
        category: 'Poissons & Fruits de mer',
        keywords: [
          'saumon',
          'thon',
          'cabillaud',
          'crevette',
          'moule',
          'poisson',
          'sardine',
          'truite',
          'bar',
          'dorade',
          'merlu',
          'colin',
          'lotte',
          'gambas',
          'anchois',
          'maquereau',
          'sole',
          'lieu',
          'flétan',
          'huître',
          'calmar',
          'poulpe',
          'langoustine',
          'crabe',
          'homard',
        ],
      },
      {
        category: 'Charcuterie',
        keywords: [
          'chorizo',
          'jambon',
          'lardons',
          'bacon',
          'saucisse',
          'merguez',
          'saucisson',
          'coppa',
          'bresaola',
          'pancetta',
          'mortadelle',
          'rosette',
          'rillettes',
          'pâté',
          'boudin',
          'andouille',
          'filet mignon fumé',
        ],
      },
      {
        category: 'Produits laitiers & Œufs',
        keywords: [
          'lait',
          'yaourt',
          'yogourt',
          'fromage',
          'crème',
          'beurre',
          'mozzarella',
          'parmesan',
          'gruyère',
          'emmental',
          'comté',
          'chèvre',
          'roquefort',
          'mascarpone',
          'ricotta',
          'feta',
          'cottage',
          'cream cheese',
          'crème fraîche',
          'crème liquide',
          'crème épaisse',
          'œuf',
          'oeuf',
        ],
      },
      {
        category: 'Légumineuses',
        keywords: [
          'lentille',
          'pois chiche',
          'haricot rouge',
          'haricot blanc',
          'haricot noir',
          'fève',
          'flageolet',
          'azuki',
          'soja',
          'edamame',
          'lupin',
        ],
      },
      {
        category: 'Céréales & Féculents',
        keywords: [
          'riz',
          'pâte',
          'pasta',
          'spaghetti',
          'penne',
          'fusilli',
          'tagliatelle',
          'nouille',
          'couscous',
          'semoule',
          'quinoa',
          'boulgour',
          'blé',
          'pain',
          'farine',
          'tortilla',
          'wrap',
          'avoine',
          'flocon',
          'muesli',
          'granola',
          'céréale',
          'maïzena',
          'fécule',
          'polenta',
          'gnocchi',
          'vermicelle',
          'lasagne',
          'orge',
          'épeautre',
          'sarrasin',
        ],
      },
      {
        category: 'Matières grasses',
        keywords: [
          'huile',
          'olive',
          'tournesol',
          'colza',
          'sésame',
          'coco',
          'beurre de cacahuète',
          "purée d'amande",
          'purée de noisette',
          'noix',
          'amande',
          'noisette',
          'cajou',
          'pistache',
          'graine',
          'lin',
          'chia',
          'sésame',
          'tournesol',
        ],
      },
      {
        category: 'Condiments & Épices',
        keywords: [
          'sel',
          'poivre',
          'paprika',
          'cumin',
          'curry',
          'curcuma',
          'cannelle',
          'muscade',
          'thym',
          'romarin',
          'origan',
          'laurier',
          'herbe de provence',
          'sauce soja',
          'vinaigre',
          'moutarde',
          'ketchup',
          'mayonnaise',
          'concentré de tomate',
          'sauce',
          'bouillon',
          'fond',
          'miel',
          'sucre',
          'sirop',
          'confiture',
          'vanille',
          'cacao',
          'levure',
          'bicarbonate',
          'poudre',
          'épice',
        ],
      },
      {
        category: 'Boissons',
        keywords: [
          'eau',
          'jus',
          'thé',
          'café',
          "lait d'avoine",
          "lait d'amande",
          'lait de coco',
          'lait de soja',
          'boisson végétale',
          'smoothie',
        ],
      },
    ];

    // Resolve category: first try food_categories FK, then keyword fallback
    function resolveCategoryId(ing: {
      name: string;
      foods?: { food_categories?: { slug?: string } } | null;
    }): string | null {
      // 1. Try food_categories slug from DB join
      const foodCatSlug = ing.foods?.food_categories?.slug;
      if (foodCatSlug) {
        const catName = slugToCatName.get(foodCatSlug);
        if (catName) return catMap.get(catName) || null;
        for (const [slug, name] of slugToCatName.entries()) {
          if (foodCatSlug.includes(slug) || slug.includes(foodCatSlug)) {
            return catMap.get(name) || null;
          }
        }
      }

      // 2. Keyword-based fallback on ingredient name
      const nameLower = ing.name.toLowerCase();
      for (const { category, keywords } of KEYWORD_CATEGORIES) {
        if (keywords.some(kw => nameLower.includes(kw))) {
          return catMap.get(category) || null;
        }
      }

      return catMap.get('Autres') || null;
    }

    // Add ingredients as items (filter out excluded)
    const excludedSet = new Set(excluded_ingredient_ids);
    const ingredients = (recipe.recipe_ingredients || []).filter(
      (ing: { id: string }) => !excludedSet.has(ing.id)
    );
    const items = ingredients.map(
      (
        ing: {
          name: string;
          quantity: string;
          quantity_value: number | null;
          quantity_unit: string | null;
          food_id: string | null;
          foods?: { food_categories?: { slug?: string } } | null;
          display_order: number;
        },
        idx: number
      ) => ({
        shopping_list_id: list.id,
        category_id: resolveCategoryId(ing),
        name: ing.name,
        quantity: ing.quantity_value
          ? `${Math.round(ing.quantity_value * servings_multiplier)} ${formatUnit(ing.quantity_unit)}`
          : ing.quantity,
        quantity_value: ing.quantity_value
          ? ing.quantity_value * servings_multiplier
          : null,
        unit: ing.quantity_unit ? formatUnit(ing.quantity_unit) : null,
        food_id: ing.food_id || null,
        recipe_id: recipe_id,
        is_checked: false,
        display_order: idx,
      })
    );

    if (items.length > 0) {
      const { error: insertError } = await s
        .from('shopping_list_items')
        .insert(items);

      if (insertError) {
        console.error('Error adding items:', insertError);
        return apiResponse.serverError(
          "Erreur lors de l'ajout des ingrédients"
        );
      }
    }

    return apiResponse.success(
      {
        list_id: list.id,
        items_added: items.length,
        recipe_title: recipe.title,
      },
      201
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/recipes/shopping-list
 * Clear all items from the active shopping list
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { data: list } = await s
      .from('shopping_lists')
      .select('id')
      .eq('patient_id', auth.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!list) {
      return apiResponse.success({ cleared: true });
    }

    // Delete all items
    await s
      .from('shopping_list_items')
      .delete()
      .eq('shopping_list_id', list.id);
    // Delete all categories
    await s
      .from('shopping_list_categories')
      .delete()
      .eq('shopping_list_id', list.id);

    return apiResponse.success({ cleared: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
