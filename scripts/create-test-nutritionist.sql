-- ============================================================================
-- Script de création d'un nutritionniste fictif pour les tests
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================================

-- Note: Ce script crée un nutritionniste directement dans les tables
-- sans passer par auth.users (car on ne peut pas créer un mot de passe en SQL)
-- Ce nutritionniste sera utilisé uniquement pour l'assignation automatique

DO $$
DECLARE
    v_nutritionist_user_id UUID := gen_random_uuid();
    v_nutritionist_profile_id UUID;
BEGIN
    -- 1. Créer le profil dans la table profiles
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        phone,
        account_status,
        auth_provider,
        consultation_reason,  -- Requis (NOT NULL)
        accepted_terms_at,
        created_at,
        updated_at
    ) VALUES (
        v_nutritionist_user_id,
        'nutritionniste.test@nutrisensia.ch',
        'Sophie',
        'Martin',
        'nutritionist',
        '+41 79 123 45 67',
        'active',
        'email',
        'autre',  -- Valeur par défaut pour les nutritionnistes
        NOW(),
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Profile créé avec ID: %', v_nutritionist_user_id;

    -- 2. Créer le profil nutritionniste
    INSERT INTO nutritionist_profiles (
        id,
        user_id,
        first_name,
        last_name,
        email,
        phone,
        specializations,
        bio,
        years_experience,
        languages,
        is_active,
        verified_at,
        status,
        asca_number,
        rme_number,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_nutritionist_user_id,
        'Sophie',
        'Martin',
        'nutritionniste.test@nutrisensia.ch',
        '+41 79 123 45 67',
        ARRAY['Nutrition générale', 'Perte de poids', 'Ménopause', 'Troubles digestifs'],
        'Nutritionniste certifiée ASCA/RME avec 10 ans d''expérience. Spécialisée dans l''accompagnement des femmes en périménopause et ménopause.',
        10,
        ARRAY['fr', 'en'],
        true,
        NOW(), -- verified_at = maintenant (nutritionniste vérifié)
        'active',
        'ASCA-12345',
        'RME-67890',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_nutritionist_profile_id;

    RAISE NOTICE 'Nutritionist profile créé avec ID: %', v_nutritionist_profile_id;

    -- 3. Afficher les informations pour la configuration
    RAISE NOTICE '============================================';
    RAISE NOTICE 'NUTRITIONNISTE TEST CRÉÉ AVEC SUCCÈS';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'User ID (pour profiles): %', v_nutritionist_user_id;
    RAISE NOTICE 'Nutritionist Profile ID: %', v_nutritionist_profile_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Pour configurer l''assignation automatique, ajoutez dans .env.local:';
    RAISE NOTICE 'DEFAULT_NUTRITIONIST_ID=%', v_nutritionist_profile_id;
    RAISE NOTICE '============================================';

END $$;

-- Vérification: Afficher le nutritionniste créé
SELECT
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    np.id as nutritionist_profile_id,
    np.is_active,
    np.verified_at,
    np.status,
    np.specializations
FROM profiles p
JOIN nutritionist_profiles np ON np.user_id = p.id
WHERE p.role = 'nutritionist'
ORDER BY p.created_at DESC
LIMIT 1;
