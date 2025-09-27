/**
 * Migration pour convertir le champ onboarding_completed de BOOLEAN vers INTEGER
 * Permet de stocker la progression de l'onboarding (0-100) directement en base
 */

-- Diagnostic initial
DO $$ 
BEGIN
    RAISE NOTICE '🔍 Migration: Conversion onboarding_completed BOOLEAN → INTEGER';
    RAISE NOTICE '📊 Vérification de la structure actuelle...';
END $$;

-- Vérifier la structure actuelle
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'nutritionists' 
  AND column_name = 'onboarding_completed';

-- Sauvegarder les données existantes dans une table temporaire
CREATE TEMP TABLE temp_onboarding_backup AS
SELECT 
    id,
    onboarding_completed,
    onboarding_completed_at,
    created_at,
    updated_at
FROM nutritionists;

-- Afficher le nombre d'enregistrements à migrer
DO $$ 
DECLARE
    total_count INTEGER;
    completed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM temp_onboarding_backup;
    SELECT COUNT(*) INTO completed_count FROM temp_onboarding_backup WHERE onboarding_completed = true;
    
    RAISE NOTICE '📈 Statistiques de migration:';
    RAISE NOTICE '   - Total nutritionnistes: %', total_count;
    RAISE NOTICE '   - Onboarding terminé: %', completed_count;
    RAISE NOTICE '   - Onboarding en cours: %', (total_count - completed_count);
END $$;

-- Étape 1: Créer une nouvelle colonne temporaire
DO $$ 
BEGIN
    RAISE NOTICE '🔄 Étape 1: Création de la colonne temporaire...';
END $$;

ALTER TABLE nutritionists 
ADD COLUMN onboarding_progress INTEGER DEFAULT 0;

-- Étape 2: Migrer les données existantes
DO $$ 
BEGIN
    RAISE NOTICE '🔄 Étape 2: Migration des données existantes...';
END $$;

UPDATE nutritionists 
SET onboarding_progress = CASE 
    WHEN onboarding_completed = true THEN 100
    ELSE 0
END;

-- Étape 3: Supprimer l'ancienne colonne
DO $$ 
BEGIN
    RAISE NOTICE '🔄 Étape 3: Suppression de l''ancienne colonne...';
END $$;

ALTER TABLE nutritionists 
DROP COLUMN onboarding_completed;

-- Étape 4: Renommer la nouvelle colonne
DO $$ 
BEGIN
    RAISE NOTICE '🔄 Étape 4: Renommage de la colonne...';
END $$;

ALTER TABLE nutritionists 
RENAME COLUMN onboarding_progress TO onboarding_completed;

-- Étape 5: Ajouter les contraintes
DO $$ 
BEGIN
    RAISE NOTICE '🔄 Étape 5: Ajout des contraintes...';
END $$;

-- Contrainte pour s'assurer que la valeur est entre 0 et 100
ALTER TABLE nutritionists 
ADD CONSTRAINT check_onboarding_progress 
CHECK (onboarding_completed >= 0 AND onboarding_completed <= 100);

-- Commentaire sur la colonne
COMMENT ON COLUMN nutritionists.onboarding_completed IS 'Progression de l''onboarding en pourcentage (0-100). 100 = terminé, 0 = non commencé';

-- Étape 6: Mettre à jour les timestamps
DO $$ 
BEGIN
    RAISE NOTICE '🔄 Étape 6: Mise à jour des timestamps...';
END $$;

-- Mettre à jour onboarding_completed_at pour les utilisateurs à 100%
UPDATE nutritionists 
SET onboarding_completed_at = NOW()
WHERE onboarding_completed = 100 
  AND onboarding_completed_at IS NULL;

-- Mettre à jour updated_at pour tous les enregistrements modifiés
UPDATE nutritionists 
SET updated_at = NOW();

-- Vérification finale
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration terminée avec succès !';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Vérification finale:';
END $$;

-- Afficher les statistiques finales
SELECT 
    'Statistiques finales' as info,
    COUNT(*) as total_nutritionists,
    COUNT(CASE WHEN onboarding_completed = 100 THEN 1 END) as completed_100,
    COUNT(CASE WHEN onboarding_completed > 0 AND onboarding_completed < 100 THEN 1 END) as in_progress,
    COUNT(CASE WHEN onboarding_completed = 0 THEN 1 END) as not_started,
    AVG(onboarding_completed) as average_progress
FROM nutritionists;

-- Vérifier la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'nutritionists' 
  AND column_name = 'onboarding_completed';

-- Afficher quelques exemples
SELECT 
    id,
    first_name,
    last_name,
    onboarding_completed,
    onboarding_completed_at,
    updated_at
FROM nutritionists 
ORDER BY onboarding_completed DESC, updated_at DESC
LIMIT 5;

-- Nettoyer la table temporaire
DROP TABLE temp_onboarding_backup;

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Migration onboarding_completed BOOLEAN → INTEGER terminée !';
    RAISE NOTICE '💡 Le champ peut maintenant stocker des valeurs de 0 à 100';
    RAISE NOTICE '🔒 100 = onboarding complètement terminé (progression figée)';
    RAISE NOTICE '📈 0-99 = onboarding en cours (progression modifiable)';
END $$;
