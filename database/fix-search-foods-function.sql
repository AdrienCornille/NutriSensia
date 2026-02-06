-- ============================================================================
-- Fix: search_foods function - Type mismatch error
-- ============================================================================
-- Problème: La fonction similarity() retourne double precision mais la fonction
-- search_foods était définie avec relevance de type real
-- Solution: Changer real → double precision dans la définition du RETURNS TABLE
-- ============================================================================

DROP FUNCTION IF EXISTS search_foods(text, uuid, int);

CREATE OR REPLACE FUNCTION search_foods(
    search_query text,
    user_id_param uuid DEFAULT NULL,
    limit_count int DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    name_fr varchar,
    brand varchar,
    calories decimal,
    proteins decimal,
    carbohydrates decimal,
    fat decimal,
    category_name varchar,
    is_favorite boolean,
    relevance double precision  -- ← CORRIGÉ : real → double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.name_fr,
        f.brand,
        f.calories,
        f.proteins,
        f.carbohydrates,
        f.fat,
        fc.name_fr as category_name,
        CASE WHEN ff.id IS NOT NULL THEN true ELSE false END as is_favorite,
        similarity(f.name_fr, search_query) +
            CASE WHEN f.brand IS NOT NULL THEN similarity(f.brand, search_query) * 0.5 ELSE 0 END as relevance
    FROM foods f
    LEFT JOIN food_categories fc ON f.category_id = fc.id
    LEFT JOIN food_favorites ff ON ff.food_id = f.id AND ff.user_id = user_id_param
    WHERE f.is_active = true
      AND (
          f.name_fr % search_query  -- Similarité trigram
          OR f.brand % search_query
          OR f.name_fr ILIKE '%' || search_query || '%'
          OR f.brand ILIKE '%' || search_query || '%'
      )
    ORDER BY
        CASE WHEN ff.id IS NOT NULL THEN 0 ELSE 1 END,  -- Favoris en premier
        relevance DESC,
        f.usage_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Vérification
SELECT * FROM search_foods('pain', NULL, 5);
