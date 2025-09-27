-- Ajout des champs manquants pour l'étape "Spécialisations" de l'onboarding
-- 1. Années d'expérience (years_of_experience)
-- 2. Certifications et formations (certifications)  
-- 3. Engagement professionnel/formation continue (continuing_education)

DO $$ 
BEGIN
    RAISE NOTICE '🔧 Ajout des champs spécialisations à la table nutritionists...';
    
    -- 1. Ajouter la colonne years_of_experience (nombre d'années d'expérience)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nutritionists' 
        AND column_name = 'years_of_experience'
    ) THEN
        ALTER TABLE nutritionists 
        ADD COLUMN years_of_experience INTEGER CHECK (years_of_experience >= 0 AND years_of_experience <= 50);
        
        RAISE NOTICE '✅ Colonne years_of_experience ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  La colonne years_of_experience existe déjà';
    END IF;
    
    -- 2. Ajouter la colonne certifications (liste des certifications)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nutritionists' 
        AND column_name = 'certifications'
    ) THEN
        ALTER TABLE nutritionists 
        ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE '✅ Colonne certifications ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  La colonne certifications existe déjà';
    END IF;
    
    -- 3. Ajouter la colonne continuing_education (engagement formation continue)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nutritionists' 
        AND column_name = 'continuing_education'
    ) THEN
        ALTER TABLE nutritionists 
        ADD COLUMN continuing_education BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE '✅ Colonne continuing_education ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  La colonne continuing_education existe déjà';
    END IF;
    
    -- Mettre à jour les nutritionnistes existants avec des valeurs par défaut
    UPDATE nutritionists 
    SET 
        certifications = COALESCE(certifications, '[]'::jsonb),
        continuing_education = COALESCE(continuing_education, FALSE)
    WHERE certifications IS NULL OR continuing_education IS NULL;
    
    RAISE NOTICE '✅ Valeurs par défaut appliquées aux nutritionnistes existants';
    
END $$;

-- Ajouter des commentaires aux colonnes
COMMENT ON COLUMN nutritionists.years_of_experience IS 'Nombre d''années d''expérience en nutrition (0-50)';
COMMENT ON COLUMN nutritionists.certifications IS 'Liste des certifications et formations du nutritionniste';
COMMENT ON COLUMN nutritionists.continuing_education IS 'Engagement à suivre une formation continue régulière';

-- Supprimer et recréer la vue nutritionist_profiles pour inclure les nouveaux champs
DROP VIEW IF EXISTS nutritionist_profiles;

CREATE VIEW nutritionist_profiles AS
SELECT 
    -- Données d'authentification (de profiles)
    p.id,
    p.email,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.last_sign_in_at,
    
    -- Données professionnelles (de nutritionists)
    n.first_name,
    n.last_name,
    n.phone,
    n.avatar_url,
    n.locale,
    n.timezone,
    n.asca_number,
    n.rme_number,
    n.ean_code,
    n.specializations,
    n.bio,
    n.years_of_experience,        -- ✅ NOUVEAU CHAMP
    n.certifications,             -- ✅ NOUVEAU CHAMP
    n.continuing_education,       -- ✅ NOUVEAU CHAMP
    n.consultation_rates,
    n.consultation_types,
    n.practice_address,
    n.verified,
    n.is_active,
    n.max_patients,
    n.profile_public,
    n.allow_contact,
    n.notification_preferences,
    n.onboarding_completed,
    n.onboarding_completed_at,
    n.created_at,
    n.updated_at
FROM profiles p
INNER JOIN nutritionists n ON p.id = n.id
WHERE p.role = 'nutritionist';

-- Ajouter un commentaire à la vue mise à jour
COMMENT ON VIEW nutritionist_profiles IS 'Vue combinée des profils nutritionnistes avec données auth et professionnelles (incluant years_of_experience, certifications, continuing_education)';

-- Vérification finale des nouvelles colonnes
SELECT 
    'nutritionists' as table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'nutritionists' 
AND column_name IN ('years_of_experience', 'certifications', 'continuing_education')
ORDER BY column_name;

-- Messages de confirmation
DO $$
BEGIN
    RAISE NOTICE '🎉 Champs spécialisations ajoutés avec succès !';
    RAISE NOTICE '✅ Vue nutritionist_profiles mise à jour';
    RAISE NOTICE '✅ Nouveaux champs disponibles:';
    RAISE NOTICE '   - years_of_experience: INTEGER (0-50)';
    RAISE NOTICE '   - certifications: JSONB (liste des formations)';
    RAISE NOTICE '   - continuing_education: BOOLEAN (engagement formation continue)';
    RAISE NOTICE '📊 Prêt pour la connexion avec l''onboarding !';
END $$;

-- Test de la vue mise à jour avec les nouveaux champs
SELECT 
    id,
    email,
    first_name,
    years_of_experience,
    certifications,
    continuing_education,
    specializations
FROM nutritionist_profiles 
LIMIT 3;
