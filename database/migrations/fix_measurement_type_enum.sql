-- Migration pour aligner l'enum measurement_type avec les noms français
-- Utilisés dans le frontend

-- 1. Créer un nouveau type temporaire avec les valeurs françaises
CREATE TYPE measurement_type_fr AS ENUM (
    'poitrine',  -- Tour de poitrine (chest)
    'taille',    -- Tour de taille (waist)
    'hanches',   -- Tour de hanches (hip)
    'cuisse',    -- Tour de cuisse (thigh)
    'bras',      -- Tour de bras (arm)
    'mollet'     -- Tour de mollet (calf)
);

-- 2. Modifier la colonne de la table measurements pour utiliser le nouveau type
-- (Si la table existe déjà et contient des données, il faudra d'abord les migrer)

-- Si la table est vide ou n'existe pas encore:
ALTER TABLE IF EXISTS measurements
    ALTER COLUMN measurement_type DROP DEFAULT,
    ALTER COLUMN measurement_type TYPE measurement_type_fr
        USING measurement_type::text::measurement_type_fr,
    ALTER COLUMN measurement_type SET DEFAULT 'poitrine'::measurement_type_fr;

-- 3. Supprimer l'ancien type (après avoir vérifié qu'il n'est plus utilisé)
DROP TYPE IF EXISTS measurement_type CASCADE;

-- 4. Renommer le nouveau type
ALTER TYPE measurement_type_fr RENAME TO measurement_type;

-- 5. Vérifier que tout fonctionne
SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'measurement_type'
ORDER BY enumsortorder;
