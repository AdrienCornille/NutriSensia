-- ============================================================================
-- Migration Fix: Complement origin_type and allergens for uncategorized foods
-- Description: Fixes foods without category_id (custom-created) by using
--              name pattern matching. Also fixes false positives (rice/gluten).
-- ============================================================================

-- ============================================================================
-- 1. FIX ORIGIN_TYPE for uncategorized foods (name-based fallback)
-- ============================================================================

-- ── ANIMAL by name ──
UPDATE foods SET origin_type = 'animal'
WHERE origin_type IN ('unknown', 'mixed')
AND category_id IS NULL
AND lower(name_fr) ~ '(poulet|dinde|canard|boeuf|veau|porc|agneau|mouton|lapin|cerf|chevreuil|biche|sanglier|pintade|caille|autruche|jambon|saucisse|merguez|chipolata|lard|bacon|steak|escalope|cuisse|aile |aile,|filet de poulet|blanc de poulet|entrecote|cote de|gigot|epaule de)';

-- ── FISH by name ──
UPDATE foods SET origin_type = 'fish'
WHERE origin_type IN ('unknown', 'mixed')
AND category_id IS NULL
AND lower(name_fr) ~ '(saumon|thon|cabillaud|merlu|sardine|maquereau|truite|sole |sole,|bar |bar,|dorade|loup de mer|anchois|hareng|morue|flet|lieu|colin|perche|brochet|carpe|espadon|raie|rouget|turbot|anguille|tilapia)';

-- ── SEAFOOD by name ──
UPDATE foods SET origin_type = 'seafood'
WHERE origin_type IN ('unknown', 'mixed')
AND category_id IS NULL
AND lower(name_fr) ~ '(crevette|crabe|homard|langouste|langoustine|huitre|moule |moule,|calamar|poulpe|seiche|bulot|bigorneau|coquille|palourde|gambas|ecrevisse)';

-- ── EGG by name ──
UPDATE foods SET origin_type = 'egg'
WHERE origin_type IN ('unknown', 'mixed')
AND category_id IS NULL
AND lower(name_fr) ~ '(^oeuf|^oeufs| oeuf| oeufs|omelette)';

-- ── DAIRY by name ──
UPDATE foods SET origin_type = 'dairy'
WHERE origin_type IN ('unknown', 'mixed')
AND category_id IS NULL
AND lower(name_fr) ~ '(^lait |^lait,|fromage|yaourt|yogourt|creme fraiche|^beurre |^beurre,|gruyere|emmental|comte|camembert|roquefort|mozzarella|parmesan|raclette|mascarpone|ricotta|feta|chevre |chevre,|reblochon|munster|beaufort|cantal)'
AND NOT lower(name_fr) ~ '(lait de coco|lait d.amande|lait de soja|lait de riz|lait d.avoine|lait d.epeautre)';

-- ── PLANT by name (common plant foods without category) ──
UPDATE foods SET origin_type = 'plant'
WHERE origin_type IN ('unknown')
AND category_id IS NULL
AND lower(name_fr) ~ '(tomate|carotte|courgette|aubergine|poivron|oignon|ail |ail,|celeri|concombre|salade|laitue|epinard|chou |chou,|haricot vert|petit pois|mais |mais,|avocat|banane|pomme |pomme,|poire|orange|citron|fraise|framboise|myrtille|mangue|ananas|melon|pasteque|raisin|cerise|peche|abricot|prune|kiwi|noix de coco|olive|champignon|patate|pomme de terre|lentille|pois chiche|quinoa|boulgour|semoule|farine|huile|vinaigre|moutarde|miel|sucre|sel |sel,|poivre|curcuma|gingembre|cannelle|basilic|persil|coriandre|thym|romarin|menthe|ciboulette|paprika|piment|curry)';

-- ============================================================================
-- 2. FIX ALLERGENS: remove false positives
-- ============================================================================

-- ── Rice is NOT gluten ──
UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) ~ '(^riz |^riz,| riz |riz basmati|riz thai|riz complet|riz blanc|riz rond|riz long|riz sauvage|riz cantonnais|galette de riz|farine de riz|lait de riz|creme de riz)'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- ── Corn/maize is NOT gluten ──
UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) ~ '(^mais |^mais,|farine de mais|semoule de mais|polenta|tortilla|pop.corn|corn flakes|maiena|maizena)'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- ── Buckwheat (sarrasin) is NOT gluten ──
UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) ~ '(sarrasin|soba |soba,|galette de ble noir)'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- ── Quinoa, millet, amaranth are NOT gluten ──
UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) ~ '(quinoa|millet|amarante|teff|sorgho)'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- ── Potato starch/flour is NOT gluten ──
UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) ~ '(fecule de pomme de terre|farine de patate|amidon de pomme de terre|rostis|galette de pomme de terre|puree de pomme de terre|pomme de terre |pomme de terre,|patate douce)'
AND NOT lower(name_fr) ~ '(gnocchi|gratin|pizza|quiche|tarte|beignet|croquette)'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- ── Rice starch/vermicelli are NOT gluten ──
UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) ~ '(amidon de riz|vermicelle de riz|nouille de riz|papier de riz|feuille de riz)'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- ── Potato-based snacks (chips, tuiles) are NOT gluten unless wheat-based ──
UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) ~ '(a base de pomme de terre|gout pomme de terre)'
AND NOT lower(name_fr) ~ '(farine de ble|ble |ble,)'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- ── Plant-based desserts "sans soja": remove wrong soja + lactose tags ──
UPDATE foods SET allergens = array_remove(allergens, 'lactose')
WHERE lower(name_fr) ~ '(dessert vegetal|boisson vegetale|yaourt vegetal|creme vegetale)'
AND 'lactose' = ANY(COALESCE(allergens, '{}'));

UPDATE foods SET allergens = array_remove(allergens, 'soja')
WHERE lower(name_fr) LIKE '%sans soja%'
AND 'soja' = ANY(COALESCE(allergens, '{}'));

-- ============================================================================
-- 3. SET empty allergens for uncategorized foods with known safe origin
-- ============================================================================

UPDATE foods SET allergens = '{}'
WHERE allergens IS NULL
AND origin_type IN ('plant', 'animal');

-- For fish/seafood: set poisson-crustace allergen
UPDATE foods SET allergens = ARRAY['poisson-crustace']
WHERE allergens IS NULL
AND origin_type IN ('fish', 'seafood');

-- For egg: set oeuf allergen
UPDATE foods SET allergens = ARRAY['oeuf']
WHERE allergens IS NULL
AND origin_type = 'egg';

-- For dairy: set lactose allergen
UPDATE foods SET allergens = ARRAY['lactose']
WHERE allergens IS NULL
AND origin_type = 'dairy';

-- Remaining unknowns: keep NULL (truly unknown)

-- ============================================================================
-- Done
-- ============================================================================

DO $$
DECLARE
  cnt_unknown INT;
  cnt_null_allergens INT;
BEGIN
  SELECT count(*) INTO cnt_unknown FROM foods WHERE origin_type = 'unknown';
  SELECT count(*) INTO cnt_null_allergens FROM foods WHERE allergens IS NULL;
  RAISE NOTICE 'Fix applied. Remaining: origin_type=unknown: %, allergens=NULL: %', cnt_unknown, cnt_null_allergens;
END $$;
