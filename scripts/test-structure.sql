-- =====================================================
-- Test de Validation de la Structure NutriSensia
-- À exécuter dans le SQL Editor de Supabase
-- =====================================================

-- Test 1: Vérification des tables principales
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'nutritionists', 'patients');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✅ Test 1 PASSÉ: Toutes les tables principales existent';
    ELSE
        RAISE EXCEPTION '❌ Test 1 ÉCHOUÉ: Tables manquantes. Nombre trouvé: %', table_count;
    END IF;
END $$;

-- Test 2: Vérification des colonnes de profiles
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name IN ('id', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar_url', 'locale', 'timezone', 'created_at', 'updated_at');
    
    IF col_count = 11 THEN
        RAISE NOTICE '✅ Test 2 PASSÉ: Toutes les colonnes de profiles existent';
    ELSE
        RAISE EXCEPTION '❌ Test 2 ÉCHOUÉ: Colonnes manquantes dans profiles. Nombre trouvé: %', col_count;
    END IF;
END $$;

-- Test 3: Vérification des index
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE tablename = 'profiles' 
    AND indexname LIKE 'idx_profiles_%';
    
    IF index_count >= 3 THEN
        RAISE NOTICE '✅ Test 3 PASSÉ: Index de performance en place (% trouvés)', index_count;
    ELSE
        RAISE EXCEPTION '❌ Test 3 ÉCHOUÉ: Index manquants. Nombre trouvé: %', index_count;
    END IF;
END $$;

-- Test 4: Vérification des triggers
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name LIKE 'update_%_updated_at';
    
    IF trigger_count >= 3 THEN
        RAISE NOTICE '✅ Test 4 PASSÉ: Triggers de mise à jour en place (% trouvés)', trigger_count;
    ELSE
        RAISE EXCEPTION '❌ Test 4 ÉCHOUÉ: Triggers manquants. Nombre trouvé: %', trigger_count;
    END IF;
END $$;

-- Test 5: Vérification des vues
DO $$
DECLARE
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_name IN ('nutritionist_profiles', 'patient_profiles');
    
    IF view_count = 2 THEN
        RAISE NOTICE '✅ Test 5 PASSÉ: Vues utilitaires créées';
    ELSE
        RAISE EXCEPTION '❌ Test 5 ÉCHOUÉ: Vues manquantes. Nombre trouvé: %', view_count;
    END IF;
END $$;

-- Test 6: Vérification des fonctions
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count 
    FROM information_schema.routines 
    WHERE routine_name IN ('get_user_profile', 'calculate_age', 'update_updated_at_column', 'handle_new_user');
    
    IF func_count = 4 THEN
        RAISE NOTICE '✅ Test 6 PASSÉ: Fonctions utilitaires créées';
    ELSE
        RAISE EXCEPTION '❌ Test 6 ÉCHOUÉ: Fonctions manquantes. Nombre trouvé: %', func_count;
    END IF;
END $$;

-- Test 7: Vérification RLS
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT row_security INTO rls_enabled 
    FROM pg_tables 
    WHERE tablename = 'profiles';
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ Test 7 PASSÉ: Row Level Security activé';
    ELSE
        RAISE EXCEPTION '❌ Test 7 ÉCHOUÉ: RLS non activé';
    END IF;
END $$;

-- Test 8: Test d'insertion temporaire
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Créer un utilisateur de test temporaire
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'test@nutrisensia.ch',
        crypt('testpassword', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW()
    ) RETURNING id INTO test_user_id;
    
    -- Vérifier que le profil a été créé automatiquement
    IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✅ Test 8 PASSÉ: Création automatique de profil fonctionne';
    ELSE
        RAISE EXCEPTION '❌ Test 8 ÉCHOUÉ: Création automatique de profil échouée';
    END IF;
    
    -- Nettoyer
    DELETE FROM auth.users WHERE id = test_user_id;
    
END $$;

-- Rapport final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Structure de base de données validée';
    RAISE NOTICE '✅ Colonnes et contraintes en place';
    RAISE NOTICE '✅ Index de performance opérationnels';
    RAISE NOTICE '✅ Triggers et fonctions fonctionnels';
    RAISE NOTICE '✅ Sécurité RLS configurée';
    RAISE NOTICE '✅ Vues utilitaires accessibles';
    RAISE NOTICE '✅ Création automatique de profils active';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 La base de données est prête pour le développement !';
    RAISE NOTICE '';
END $$;
