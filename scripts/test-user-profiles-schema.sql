-- =====================================================
-- NutriSensia - Tests du Schéma de Base de Données des Profils
-- Tâche 4.1: Validation du Design Database Schema
-- =====================================================

-- =====================================================
-- 1. TESTS DE VALIDATION DU SCHÉMA
-- =====================================================

-- Test 1: Vérifier que les tables existent
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'nutritionists', 'patients');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✅ Toutes les tables principales existent';
    ELSE
        RAISE EXCEPTION '❌ Tables manquantes. Nombre trouvé: %', table_count;
    END IF;
END $$;

-- Test 2: Vérifier les contraintes de clés étrangères
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name IN ('profiles', 'nutritionists', 'patients');
    
    IF fk_count >= 3 THEN
        RAISE NOTICE '✅ Contraintes de clés étrangères présentes: %', fk_count;
    ELSE
        RAISE EXCEPTION '❌ Contraintes de clés étrangères manquantes. Nombre trouvé: %', fk_count;
    END IF;
END $$;

-- Test 3: Vérifier les index de performance
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE tablename IN ('profiles', 'nutritionists', 'patients')
    AND indexname LIKE 'idx_%';
    
    IF index_count >= 10 THEN
        RAISE NOTICE '✅ Index de performance présents: %', index_count;
    ELSE
        RAISE EXCEPTION '❌ Index de performance manquants. Nombre trouvé: %', index_count;
    END IF;
END $$;

-- Test 4: Vérifier les triggers
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%updated_at%';
    
    IF trigger_count >= 3 THEN
        RAISE NOTICE '✅ Triggers updated_at présents: %', trigger_count;
    ELSE
        RAISE EXCEPTION '❌ Triggers updated_at manquants. Nombre trouvé: %', trigger_count;
    END IF;
END $$;

-- =====================================================
-- 2. TESTS DE DONNÉES DE VALIDATION
-- =====================================================

-- Créer des données de test temporaires
DO $$
DECLARE
    test_user_id UUID;
    test_nutritionist_id UUID;
    test_patient_id UUID;
BEGIN
    -- Générer des UUIDs de test
    test_user_id := gen_random_uuid();
    test_nutritionist_id := gen_random_uuid();
    test_patient_id := gen_random_uuid();
    
    -- Test 5: Insérer un profil de base
    BEGIN
        INSERT INTO profiles (id, email, first_name, last_name, role)
        VALUES (test_user_id, 'test@example.com', 'Test', 'User', 'admin');
        RAISE NOTICE '✅ Insertion profil de base réussie';
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Échec insertion profil de base: %', SQLERRM;
    END;
    
    -- Test 6: Insérer un nutritionniste
    BEGIN
        INSERT INTO profiles (id, email, first_name, last_name, role)
        VALUES (test_nutritionist_id, 'nutritionist@example.com', 'Dr', 'Nutrition', 'nutritionist');
        
        INSERT INTO nutritionists (id, asca_number, rme_number, specializations)
        VALUES (test_nutritionist_id, 'ASCA123456', 'RME789012', ARRAY['Diététique', 'Sport']);
        RAISE NOTICE '✅ Insertion nutritionniste réussie';
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Échec insertion nutritionniste: %', SQLERRM;
    END;
    
    -- Test 7: Insérer un patient
    BEGIN
        INSERT INTO profiles (id, email, first_name, last_name, role)
        VALUES (test_patient_id, 'patient@example.com', 'John', 'Doe', 'patient');
        
        INSERT INTO patients (id, nutritionist_id, date_of_birth, height, initial_weight, activity_level)
        VALUES (test_patient_id, test_nutritionist_id, '1990-01-01', 175, 70.5, 'moderate');
        RAISE NOTICE '✅ Insertion patient réussie';
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Échec insertion patient: %', SQLERRM;
    END;
    
    -- Test 8: Tester les contraintes de validation
    BEGIN
        -- Tester contrainte de rôle invalide
        INSERT INTO profiles (id, email, first_name, last_name, role)
        VALUES (gen_random_uuid(), 'invalid@example.com', 'Invalid', 'Role', 'invalid_role');
        RAISE EXCEPTION '❌ Contrainte de rôle non respectée';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE '✅ Contrainte de rôle respectée';
    END;
    
    -- Test 9: Tester les vues
    BEGIN
        PERFORM COUNT(*) FROM nutritionist_profiles WHERE id = test_nutritionist_id;
        RAISE NOTICE '✅ Vue nutritionist_profiles fonctionnelle';
        
        PERFORM COUNT(*) FROM patient_profiles WHERE id = test_patient_id;
        RAISE NOTICE '✅ Vue patient_profiles fonctionnelle';
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Échec test des vues: %', SQLERRM;
    END;
    
    -- Test 10: Tester la fonction get_user_profile
    BEGIN
        PERFORM get_user_profile(test_nutritionist_id);
        RAISE NOTICE '✅ Fonction get_user_profile fonctionnelle pour nutritionniste';
        
        PERFORM get_user_profile(test_patient_id);
        RAISE NOTICE '✅ Fonction get_user_profile fonctionnelle pour patient';
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Échec test fonction get_user_profile: %', SQLERRM;
    END;
    
    -- Test 11: Tester la fonction calculate_age
    BEGIN
        IF calculate_age('1990-01-01') > 0 THEN
            RAISE NOTICE '✅ Fonction calculate_age fonctionnelle';
        ELSE
            RAISE EXCEPTION '❌ Fonction calculate_age incorrecte';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Échec test fonction calculate_age: %', SQLERRM;
    END;
    
    -- Nettoyer les données de test
    DELETE FROM patients WHERE id = test_patient_id;
    DELETE FROM nutritionists WHERE id = test_nutritionist_id;
    DELETE FROM profiles WHERE id IN (test_user_id, test_nutritionist_id, test_patient_id);
    RAISE NOTICE '🧹 Données de test nettoyées';
    
END $$;

-- =====================================================
-- 3. TESTS DE PERFORMANCE
-- =====================================================

-- Test 12: Vérifier les performances des requêtes
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms INTEGER;
BEGIN
    -- Test de performance sur les profils
    start_time := clock_timestamp();
    PERFORM COUNT(*) FROM profiles;
    end_time := clock_timestamp();
    duration_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    IF duration_ms < 100 THEN
        RAISE NOTICE '✅ Performance requête profiles: % ms', duration_ms;
    ELSE
        RAISE WARNING '⚠️ Performance requête profiles lente: % ms', duration_ms;
    END IF;
    
    -- Test de performance sur les vues
    start_time := clock_timestamp();
    PERFORM COUNT(*) FROM nutritionist_profiles;
    end_time := clock_timestamp();
    duration_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    IF duration_ms < 100 THEN
        RAISE NOTICE '✅ Performance vue nutritionist_profiles: % ms', duration_ms;
    ELSE
        RAISE WARNING '⚠️ Performance vue nutritionist_profiles lente: % ms', duration_ms;
    END IF;
END $$;

-- =====================================================
-- 4. TESTS DE SÉCURITÉ RLS
-- =====================================================

-- Test 13: Vérifier que RLS est activé
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT rowsecurity INTO rls_enabled 
    FROM pg_tables 
    WHERE tablename = 'profiles';
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ RLS activé sur la table profiles';
    ELSE
        RAISE EXCEPTION '❌ RLS non activé sur la table profiles';
    END IF;
    
    SELECT rowsecurity INTO rls_enabled 
    FROM pg_tables 
    WHERE tablename = 'nutritionists';
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ RLS activé sur la table nutritionists';
    ELSE
        RAISE EXCEPTION '❌ RLS non activé sur la table nutritionists';
    END IF;
    
    SELECT rowsecurity INTO rls_enabled 
    FROM pg_tables 
    WHERE tablename = 'patients';
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ RLS activé sur la table patients';
    ELSE
        RAISE EXCEPTION '❌ RLS non activé sur la table patients';
    END IF;
END $$;

-- =====================================================
-- 5. RAPPORT FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🎉 TESTS DU SCHÉMA DE BASE DE DONNÉES TERMINÉS';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Schéma validé avec succès';
    RAISE NOTICE '✅ Contraintes et index en place';
    RAISE NOTICE '✅ Triggers et fonctions opérationnels';
    RAISE NOTICE '✅ Sécurité RLS configurée';
    RAISE NOTICE '✅ Vues et fonctions utilitaires fonctionnelles';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Prochaines étapes:';
    RAISE NOTICE '   - Implémenter les schémas Zod (Tâche 4.2)';
    RAISE NOTICE '   - Créer les formulaires de profil (Tâche 4.3)';
    RAISE NOTICE '   - Ajouter la gestion des photos (Tâche 4.4)';
    RAISE NOTICE '   - Implémenter le suivi de complétion (Tâche 4.5)';
    RAISE NOTICE '';
END $$;
