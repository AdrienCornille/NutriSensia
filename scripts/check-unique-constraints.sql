/**
 * Script pour vérifier les contraintes d'unicité dans la table nutritionists
 */

-- Vérifier les contraintes d'unicité existantes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'nutritionists'::regclass
  AND contype = 'u'; -- 'u' = unique constraint

-- Vérifier les valeurs dupliquées dans les champs qui ont des contraintes d'unicité
SELECT 
    'asca_number' as field_name,
    asca_number as value,
    COUNT(*) as count
FROM nutritionists 
WHERE asca_number IS NOT NULL AND asca_number != ''
GROUP BY asca_number
HAVING COUNT(*) > 1

UNION ALL

SELECT 
    'rme_number' as field_name,
    rme_number as value,
    COUNT(*) as count
FROM nutritionists 
WHERE rme_number IS NOT NULL AND rme_number != ''
GROUP BY rme_number
HAVING COUNT(*) > 1

UNION ALL

SELECT 
    'ean_code' as field_name,
    ean_code as value,
    COUNT(*) as count
FROM nutritionists 
WHERE ean_code IS NOT NULL AND ean_code != ''
GROUP BY ean_code
HAVING COUNT(*) > 1;

-- Afficher tous les nutritionnistes avec leurs numéros
SELECT 
    id,
    first_name,
    last_name,
    asca_number,
    rme_number,
    ean_code,
    created_at
FROM nutritionists 
ORDER BY created_at DESC;
