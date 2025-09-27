/**
 * Script pour vérifier et nettoyer les données en conflit
 */

-- Vérifier les doublons dans les champs uniques
SELECT 
    'asca_number' as field_name,
    asca_number as value,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids
FROM nutritionists 
WHERE asca_number IS NOT NULL AND asca_number != ''
GROUP BY asca_number
HAVING COUNT(*) > 1

UNION ALL

SELECT 
    'rme_number' as field_name,
    rme_number as value,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids
FROM nutritionists 
WHERE rme_number IS NOT NULL AND rme_number != ''
GROUP BY rme_number
HAVING COUNT(*) > 1

UNION ALL

SELECT 
    'ean_code' as field_name,
    ean_code as value,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids
FROM nutritionists 
WHERE ean_code IS NOT NULL AND ean_code != ''
GROUP BY ean_code
HAVING COUNT(*) > 1;

-- Afficher tous les nutritionnistes avec leurs données
SELECT 
    id,
    first_name,
    last_name,
    asca_number,
    rme_number,
    ean_code,
    created_at,
    updated_at
FROM nutritionists 
ORDER BY created_at DESC;

-- Optionnel: Nettoyer les doublons (ATTENTION: à utiliser avec précaution)
-- UPDATE nutritionists 
-- SET rme_number = NULL 
-- WHERE id = 'b2e90857-be97-4b7d-bf32-4f8bedbdb801' 
--   AND rme_number IS NOT NULL;
