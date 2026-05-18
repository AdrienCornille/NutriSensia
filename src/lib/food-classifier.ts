// ============================================================================
// Food Classifier
// Classifies a food's origin_type and allergens from its name.
// Used when creating custom foods without a CIQUAL category.
// Pure utility — no DB dependency.
// ============================================================================

import type { FoodOrigin } from '@/lib/recipe-diet-analyzer';

interface FoodClassification {
  origin_type: FoodOrigin;
  allergens: string[];
}

// ── Origin patterns (order matters: first match wins) ──

const ORIGIN_PATTERNS: { origin: FoodOrigin; pattern: RegExp }[] = [
  {
    origin: 'fish',
    pattern:
      /saumon|thon|cabillaud|merlu|sardine|maquereau|truite|sole\b|bar\b|dorade|loup de mer|anchois|hareng|morue|flet|lieu\b|colin|perche|brochet|carpe|espadon|raie|rouget|turbot|anguille|tilapia/,
  },
  {
    origin: 'seafood',
    pattern:
      /crevette|crabe|homard|langouste|langoustine|huitre|moule\b|calamar|poulpe|seiche|bulot|bigorneau|coquille|palourde|gambas|ecrevisse/,
  },
  {
    origin: 'egg',
    pattern: /^oeuf|^oeufs|\boeuf\b|\boeufs\b|omelette/,
  },
  {
    origin: 'dairy',
    pattern:
      /^lait\b|^beurre\b|fromage|yaourt|yogourt|creme fraiche|gruyere|emmental|comte|camembert|roquefort|mozzarella|parmesan|raclette|mascarpone|ricotta|feta|reblochon|munster|beaufort|cantal/,
  },
  {
    origin: 'animal',
    pattern:
      /poulet|dinde|canard|boeuf|veau|porc|agneau|mouton|lapin|cerf|chevreuil|sanglier|pintade|caille|jambon|saucisse|merguez|chipolata|lard|bacon|steak|escalope|filet de poulet|blanc de poulet|entrecote|gigot|chorizo|salami|viande|volaille/,
  },
  {
    origin: 'plant',
    pattern:
      /tomate|carotte|courgette|aubergine|poivron|oignon|ail\b|celeri|concombre|salade|laitue|epinard|chou\b|haricot|petit pois|mais\b|avocat|banane|pomme\b|poire|orange|citron|fraise|framboise|myrtille|mangue|ananas|melon|raisin|cerise|kiwi|olive|champignon|pomme de terre|patate|lentille|pois chiche|quinoa|riz\b|boulgour|semoule|farine|huile|vinaigre|moutarde|miel|sucre|sel\b|poivre|curcuma|gingembre|cannelle|basilic|persil|coriandre|thym|romarin|menthe|ciboulette|paprika|piment|curry|brocoli|navet|radis|fenouil|artichaut|asperge|betterave|endive|poireau|panais|noix de coco|amande|noisette|noix\b|pistache|soja|tofu|tempeh/,
  },
];

// ── Allergen patterns ──

const ALLERGEN_PATTERNS: {
  allergen: string;
  pattern: RegExp;
  excludePattern?: RegExp;
}[] = [
  {
    allergen: 'gluten',
    pattern:
      /ble\b|seigle|orge|avoine|epeautre|kamut|farine(?!.*(?:riz|mais|patate|chataigne|coco|sarrasin))|pain\b|pates\b|biscuit|gateau|crepe|galette(?!.*pomme de terre)|brioche|croissant|pizza|quiche|tarte\b|couscous|boulgour|semoul/,
    excludePattern:
      /sans gluten|riz|mais\b|quinoa|sarrasin|millet|sorgho|tapioca|pomme de terre|patate/,
  },
  {
    allergen: 'lactose',
    pattern:
      /^lait\b|^beurre\b|fromage|yaourt|yogourt|creme fraiche|gruyere|emmental|comte|camembert|roquefort|mozzarella|parmesan|raclette|mascarpone|ricotta|feta|fondue/,
    excludePattern:
      /sans lactose|lait de coco|lait d.amande|lait de soja|lait de riz|lait d.avoine|vegetal/,
  },
  {
    allergen: 'oeuf',
    pattern: /^oeuf|^oeufs|\boeuf\b|\boeufs\b|omelette|mayonnaise|meringue/,
  },
  {
    allergen: 'arachide',
    pattern: /arachide|cacahuete|cacahouete|beurre de cacah/,
  },
  {
    allergen: 'fruits-a-coque',
    pattern:
      /noix\b(?!.*(?:coco|muscade))|noix de cajou|noisette|amande\b|pistache|pecan|macadamia|pignon|praline|nougat/,
  },
  {
    allergen: 'poisson-crustace',
    pattern:
      /saumon|thon|cabillaud|merlu|sardine|maquereau|truite|sole\b|dorade|anchois|hareng|morue|crevette|crabe|homard|langouste|huitre|moule\b|calamar|poulpe|surimi/,
  },
  {
    allergen: 'soja',
    pattern: /soja|tofu|tempeh|edamame|miso\b|sauce soja/,
  },
];

/**
 * Classify a food by name, returning origin_type and allergens.
 * Used at food creation time for custom foods without a CIQUAL category.
 */
export function classifyFood(nameFr: string): FoodClassification {
  const name = nameFr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove accents for matching

  // Determine origin
  let origin: FoodOrigin = 'unknown';
  for (const { origin: o, pattern } of ORIGIN_PATTERNS) {
    if (pattern.test(name)) {
      origin = o;
      break;
    }
  }

  // Determine allergens
  const allergens: string[] = [];
  for (const { allergen, pattern, excludePattern } of ALLERGEN_PATTERNS) {
    if (pattern.test(name)) {
      if (excludePattern && excludePattern.test(name)) continue;
      allergens.push(allergen);
    }
  }

  return { origin_type: origin, allergens };
}
