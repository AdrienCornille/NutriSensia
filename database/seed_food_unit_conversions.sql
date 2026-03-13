-- ============================================================================
-- Seed: food_unit_conversions
-- Conversions d'unités exactes par catégorie CIQUAL et par aliment
-- Sources: FSANZ Specific Gravities, FAO/INFOODS Density Database v2.0
-- ============================================================================

-- ============================================================================
-- PARTIE 1 : Conversions PAR CATÉGORIE (fallback quand pas de conversion aliment)
-- ============================================================================
-- Volumes de référence: c.à.s. = 15 ml, c.à.c. = 5 ml, tasse = 250 ml (métrique CH)

-- ----- LAITS (ciqual-0501) - densité 1.03 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.030
FROM food_categories WHERE slug = 'ciqual-0501'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.450
FROM food_categories WHERE slug = 'ciqual-0501'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.150
FROM food_categories WHERE slug = 'ciqual-0501'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'tasse', 'tasse (250 ml)', 257.500
FROM food_categories WHERE slug = 'ciqual-0501'
ON CONFLICT DO NOTHING;

-- ----- PRODUITS LAITIERS FRAIS (ciqual-0502) - yaourts etc - densité 1.04 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.040
FROM food_categories WHERE slug = 'ciqual-0502'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.600
FROM food_categories WHERE slug = 'ciqual-0502'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.200
FROM food_categories WHERE slug = 'ciqual-0502'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (125 g)', 125.000
FROM food_categories WHERE slug = 'ciqual-0502'
ON CONFLICT DO NOTHING;

-- ----- CRÈMES (ciqual-0504) - densité 1.01 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.010
FROM food_categories WHERE slug = 'ciqual-0504'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.150
FROM food_categories WHERE slug = 'ciqual-0504'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.050
FROM food_categories WHERE slug = 'ciqual-0504'
ON CONFLICT DO NOTHING;

-- ----- EAUX (ciqual-0601) - densité 1.00 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.000
FROM food_categories WHERE slug = 'ciqual-0601'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'tasse', 'tasse (250 ml)', 250.000
FROM food_categories WHERE slug = 'ciqual-0601'
ON CONFLICT DO NOTHING;

-- ----- BOISSONS SANS ALCOOL (ciqual-0602) - jus, sodas - densité 1.05 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.050
FROM food_categories WHERE slug = 'ciqual-0602'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'tasse', 'tasse (250 ml)', 262.500
FROM food_categories WHERE slug = 'ciqual-0602'
ON CONFLICT DO NOTHING;

-- ----- BOISSONS ALCOOLISÉES (ciqual-0603) - vin, bière - densité 1.01 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.010
FROM food_categories WHERE slug = 'ciqual-0603'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'tasse', 'tasse (250 ml)', 252.500
FROM food_categories WHERE slug = 'ciqual-0603'
ON CONFLICT DO NOTHING;

-- ----- HUILES VÉGÉTALES (ciqual-0902) - densité 0.92 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 0.920
FROM food_categories WHERE slug = 'ciqual-0902'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 13.800
FROM food_categories WHERE slug = 'ciqual-0902'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 4.600
FROM food_categories WHERE slug = 'ciqual-0902'
ON CONFLICT DO NOTHING;

-- ----- BEURRES (ciqual-0901) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.000
FROM food_categories WHERE slug = 'ciqual-0901'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.000
FROM food_categories WHERE slug = 'ciqual-0901'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (10 g)', 10.000
FROM food_categories WHERE slug = 'ciqual-0901'
ON CONFLICT DO NOTHING;

-- ----- MARGARINES (ciqual-0903) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.000
FROM food_categories WHERE slug = 'ciqual-0903'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.000
FROM food_categories WHERE slug = 'ciqual-0903'
ON CONFLICT DO NOTHING;

-- ----- SUCRES, MIELS (ciqual-0701) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.000
FROM food_categories WHERE slug = 'ciqual-0701'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.000
FROM food_categories WHERE slug = 'ciqual-0701'
ON CONFLICT DO NOTHING;

-- ----- SAUCES (ciqual-1001) - densité ~1.03 -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.030
FROM food_categories WHERE slug = 'ciqual-1001'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.450
FROM food_categories WHERE slug = 'ciqual-1001'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.150
FROM food_categories WHERE slug = 'ciqual-1001'
ON CONFLICT DO NOTHING;

-- ----- CONDIMENTS (ciqual-1002) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.000
FROM food_categories WHERE slug = 'ciqual-1002'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.000
FROM food_categories WHERE slug = 'ciqual-1002'
ON CONFLICT DO NOTHING;

-- ----- SELS (ciqual-1004) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 18.000
FROM food_categories WHERE slug = 'ciqual-1004'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.000
FROM food_categories WHERE slug = 'ciqual-1004'
ON CONFLICT DO NOTHING;

-- ----- ÉPICES (ciqual-1005) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 8.000
FROM food_categories WHERE slug = 'ciqual-1005'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 3.000
FROM food_categories WHERE slug = 'ciqual-1005'
ON CONFLICT DO NOTHING;

-- ----- FARINES (ciqual-0304) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 12.000
FROM food_categories WHERE slug = 'ciqual-0304'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 4.000
FROM food_categories WHERE slug = 'ciqual-0304'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'tasse', 'tasse (250 ml)', 115.000
FROM food_categories WHERE slug = 'ciqual-0304'
ON CONFLICT DO NOTHING;

-- ----- PÂTES, RIZ, CÉRÉALES (ciqual-0301) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 18.000
FROM food_categories WHERE slug = 'ciqual-0301'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'tasse', 'tasse (250 ml)', 185.000
FROM food_categories WHERE slug = 'ciqual-0301'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (80 g cru)', 80.000
FROM food_categories WHERE slug = 'ciqual-0301'
ON CONFLICT DO NOTHING;

-- ----- CÉRÉALES PETIT-DÉJEUNER (ciqual-0707) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 5.000
FROM food_categories WHERE slug = 'ciqual-0707'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (30 g)', 30.000
FROM food_categories WHERE slug = 'ciqual-0707'
ON CONFLICT DO NOTHING;

-- ----- CONFITURES (ciqual-0704) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 20.000
FROM food_categories WHERE slug = 'ciqual-0704'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 7.000
FROM food_categories WHERE slug = 'ciqual-0704'
ON CONFLICT DO NOTHING;

-- ----- FROMAGES (ciqual-0503) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (30 g)', 30.000
FROM food_categories WHERE slug = 'ciqual-0503'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe (râpé)', 5.000
FROM food_categories WHERE slug = 'ciqual-0503'
ON CONFLICT DO NOTHING;

-- ----- PAINS (ciqual-0302) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'piece', 'tranche', 30.000
FROM food_categories WHERE slug = 'ciqual-0302'
ON CONFLICT DO NOTHING;

-- ----- OEUFS (ciqual-0410) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'piece', 'pièce (sans coquille)', 55.000
FROM food_categories WHERE slug = 'ciqual-0410'
ON CONFLICT DO NOTHING;

-- ----- FRUITS (ciqual-0204) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'piece', 'pièce (moyenne)', 130.000
FROM food_categories WHERE slug = 'ciqual-0204'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (150 g)', 150.000
FROM food_categories WHERE slug = 'ciqual-0204'
ON CONFLICT DO NOTHING;

-- ----- FRUITS À COQUE (ciqual-0205) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 10.000
FROM food_categories WHERE slug = 'ciqual-0205'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (30 g)', 30.000
FROM food_categories WHERE slug = 'ciqual-0205'
ON CONFLICT DO NOTHING;

-- ----- LÉGUMES (ciqual-0201) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (200 g)', 200.000
FROM food_categories WHERE slug = 'ciqual-0201'
ON CONFLICT DO NOTHING;

-- ----- LÉGUMINEUSES (ciqual-0203) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 20.000
FROM food_categories WHERE slug = 'ciqual-0203'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (80 g sec)', 80.000
FROM food_categories WHERE slug = 'ciqual-0203'
ON CONFLICT DO NOTHING;

-- ----- VIANDES CUITES (ciqual-0401) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (120 g)', 120.000
FROM food_categories WHERE slug = 'ciqual-0401'
ON CONFLICT DO NOTHING;

-- ----- POISSONS CUITS (ciqual-0405) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (130 g)', 130.000
FROM food_categories WHERE slug = 'ciqual-0405'
ON CONFLICT DO NOTHING;

-- ----- GLACES (ciqual-0801) -----
INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 0.560
FROM food_categories WHERE slug = 'ciqual-0801'
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_category_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'boule (60 g)', 60.000
FROM food_categories WHERE slug = 'ciqual-0801'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- PARTIE 2 : Conversions PAR ALIMENT (prioritaires, plus précises)
-- Recherchées via name_fr ILIKE pour cibler les aliments les plus courants
-- Sources: FSANZ Specific Gravities, FAO/INFOODS Density DB v2.0
-- ============================================================================

-- ----- MIEL - densité 1.43 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.430
FROM foods WHERE name_fr ILIKE '%miel%' AND name_fr NOT ILIKE '%bonbon%' AND name_fr NOT ILIKE '%gâteau%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 21.450
FROM foods WHERE name_fr ILIKE '%miel%' AND name_fr NOT ILIKE '%bonbon%' AND name_fr NOT ILIKE '%gâteau%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 7.150
FROM foods WHERE name_fr ILIKE '%miel%' AND name_fr NOT ILIKE '%bonbon%' AND name_fr NOT ILIKE '%gâteau%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- SIROP D'ÉRABLE - densité 1.33 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.330
FROM foods WHERE name_fr ILIKE '%sirop d%érable%' LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 19.950
FROM foods WHERE name_fr ILIKE '%sirop d%érable%' LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 6.650
FROM foods WHERE name_fr ILIKE '%sirop d%érable%' LIMIT 3
ON CONFLICT DO NOTHING;

-- ----- HUILE D'OLIVE - densité 0.91 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 0.910
FROM foods WHERE name_fr ILIKE '%huile d%olive%' LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 13.650
FROM foods WHERE name_fr ILIKE '%huile d%olive%' LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 4.550
FROM foods WHERE name_fr ILIKE '%huile d%olive%' LIMIT 3
ON CONFLICT DO NOTHING;

-- ----- HUILE DE COLZA - densité 0.91 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 0.910
FROM foods WHERE name_fr ILIKE '%huile%colza%' LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 13.650
FROM foods WHERE name_fr ILIKE '%huile%colza%' LIMIT 3
ON CONFLICT DO NOTHING;

-- ----- HUILE DE TOURNESOL - densité 0.92 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 0.920
FROM foods WHERE name_fr ILIKE '%huile%tournesol%' LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 13.800
FROM foods WHERE name_fr ILIKE '%huile%tournesol%' LIMIT 3
ON CONFLICT DO NOTHING;

-- ----- HUILE DE COCO - densité 0.92 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 0.920
FROM foods WHERE name_fr ILIKE '%huile%coco%' LIMIT 3
ON CONFLICT DO NOTHING;

-- ----- LAIT DE COCO - densité 1.01 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.010
FROM foods WHERE name_fr ILIKE '%lait de coco%' LIMIT 3
ON CONFLICT DO NOTHING;

-- ----- SAUCE SOJA - densité 1.05 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.050
FROM foods WHERE name_fr ILIKE '%sauce soja%' OR name_fr ILIKE '%sauce de soja%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.750
FROM foods WHERE name_fr ILIKE '%sauce soja%' OR name_fr ILIKE '%sauce de soja%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.250
FROM foods WHERE name_fr ILIKE '%sauce soja%' OR name_fr ILIKE '%sauce de soja%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- VINAIGRE - densité 1.01 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'ml', 'millilitres', 1.010
FROM foods WHERE name_fr ILIKE '%vinaigre%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.150
FROM foods WHERE name_fr ILIKE '%vinaigre%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- MAYONNAISE - densité 0.99 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 14.850
FROM foods WHERE name_fr ILIKE '%mayonnaise%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 4.950
FROM foods WHERE name_fr ILIKE '%mayonnaise%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- KETCHUP - densité ~1.15 -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 17.000
FROM foods WHERE name_fr ILIKE '%ketchup%' LIMIT 3
ON CONFLICT DO NOTHING;

-- ----- MOUTARDE -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.000
FROM foods WHERE name_fr ILIKE '%moutarde%' AND name_fr NOT ILIKE '%sauce%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- FLOCONS D'AVOINE -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 5.000
FROM foods WHERE name_fr ILIKE '%flocons d%avoine%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'portion (40 g)', 40.000
FROM foods WHERE name_fr ILIKE '%flocons d%avoine%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- SUCRE EN POUDRE -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 15.000
FROM foods WHERE name_fr ILIKE '%sucre%poudre%' OR name_fr ILIKE '%sucre blanc%' OR name_fr ILIKE '%sucre semoule%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 5.000
FROM foods WHERE name_fr ILIKE '%sucre%poudre%' OR name_fr ILIKE '%sucre blanc%' OR name_fr ILIKE '%sucre semoule%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'piece', 'morceau (6 g)', 6.000
FROM foods WHERE name_fr ILIKE '%sucre%poudre%' OR name_fr ILIKE '%sucre blanc%' OR name_fr ILIKE '%sucre semoule%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- CRÈME FRAÎCHE -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 12.000
FROM foods WHERE name_fr ILIKE '%crème fraîche%' OR name_fr ILIKE '%creme fraiche%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- BEURRE -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'portion', 'noisette (8 g)', 8.000
FROM foods WHERE name_fr ILIKE '%beurre%' AND name_fr NOT ILIKE '%cacahuète%' AND name_fr NOT ILIKE '%arachide%' AND name_fr NOT ILIKE '%beurre de%' LIMIT 5
ON CONFLICT DO NOTHING;

-- ----- BEURRE DE CACAHUÈTE -----
INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_s', 'cuillère à soupe', 16.000
FROM foods WHERE name_fr ILIKE '%beurre%cacahuète%' OR name_fr ILIKE '%beurre%arachide%' OR name_fr ILIKE '%pâte%arachide%' LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO food_unit_conversions (food_id, unit, label, gram_equivalent)
SELECT id, 'c_a_c', 'cuillère à café', 6.000
FROM foods WHERE name_fr ILIKE '%beurre%cacahuète%' OR name_fr ILIKE '%beurre%arachide%' OR name_fr ILIKE '%pâte%arachide%' LIMIT 5
ON CONFLICT DO NOTHING;
