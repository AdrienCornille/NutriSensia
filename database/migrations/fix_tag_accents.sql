-- ============================================================================
-- Migration Fix: Correct French accents on recipe_tags name_fr
-- ============================================================================

UPDATE recipe_tags SET name_fr = 'Petit-déjeuner' WHERE slug = 'petit-dej';
UPDATE recipe_tags SET name_fr = 'Déjeuner' WHERE slug = 'dejeuner';
UPDATE recipe_tags SET name_fr = 'Dîner' WHERE slug = 'diner';
UPDATE recipe_tags SET name_fr = 'Sucré' WHERE slug = 'sucre';
UPDATE recipe_tags SET name_fr = 'Salé' WHERE slug = 'sale';
UPDATE recipe_tags SET name_fr = 'Sucré-salé' WHERE slug = 'sucre-sale';
UPDATE recipe_tags SET name_fr = 'Soupes & veloutés' WHERE slug = 'soupes-veloutes';
UPDATE recipe_tags SET name_fr = 'Pâtes' WHERE slug = 'pates';
UPDATE recipe_tags SET name_fr = 'Apéro healthy' WHERE slug = 'apero-healthy';
UPDATE recipe_tags SET name_fr = 'Gâteaux' WHERE slug = 'gateaux';
UPDATE recipe_tags SET name_fr = 'Été' WHERE slug = 'ete';
UPDATE recipe_tags SET name_fr = 'Pâques' WHERE slug = 'paques';
UPDATE recipe_tags SET name_fr = 'Noël' WHERE slug = 'noel';
UPDATE recipe_tags SET name_fr = 'Française' WHERE slug = 'francaise';
UPDATE recipe_tags SET name_fr = 'Méditerranéenne' WHERE slug = 'mediterraneenne';
UPDATE recipe_tags SET name_fr = 'Énergie & récupération' WHERE slug = 'energie-recuperation';
UPDATE recipe_tags SET name_fr = 'Détox' WHERE slug = 'detox';
UPDATE recipe_tags SET name_fr = 'Végan' WHERE slug = 'vegan';
UPDATE recipe_tags SET name_fr = 'Végétarien' WHERE slug = 'vegetarien';
UPDATE recipe_tags SET name_fr = 'Post-entraînement' WHERE slug = 'post-entrainement';
UPDATE recipe_tags SET name_fr = 'Œufs' WHERE slug = 'ciqual-0410';

DO $$
BEGIN
  RAISE NOTICE 'Fix accents terminé avec succès';
END $$;
