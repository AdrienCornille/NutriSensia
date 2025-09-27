-- =====================================================
-- Vérification des Vues et Politiques RLS
-- =====================================================

-- 1. Lister toutes les vues existantes
DO $$
DECLARE
    view_record RECORD;
    view_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 VUES EXISTANTES DANS LA BASE DE DONNÉES';
    RAISE NOTICE '=====================================================';
    
    FOR view_record IN 
        SELECT 
            table_name,
            table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'VIEW'
        ORDER BY table_name
    LOOP
        view_count := view_count + 1;
        RAISE NOTICE 'Vue %: %', view_count, view_record.table_name;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 TOTAL: % vues trouvées', view_count;
    RAISE NOTICE '';
END $$;

-- 2. Vérifier les politiques RLS sur les vues
DO $$
DECLARE
    view_name TEXT;
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VÉRIFICATION DES POLITIQUES RLS SUR LES VUES';
    RAISE NOTICE '=====================================================';
    
    -- Vérifier nutritionist_profiles
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'nutritionist_profiles') THEN
        SELECT rowsecurity INTO rls_enabled 
        FROM pg_tables 
        WHERE tablename = 'nutritionist_profiles';
        
        SELECT COUNT(*) INTO policy_count 
        FROM pg_policies 
        WHERE tablename = 'nutritionist_profiles';
        
        RAISE NOTICE 'nutritionist_profiles:';
        RAISE NOTICE '  - RLS activé: %', CASE WHEN rls_enabled THEN 'OUI' ELSE 'NON' END;
        RAISE NOTICE '  - Politiques: %', policy_count;
    ELSE
        RAISE NOTICE 'nutritionist_profiles: VUE N''EXISTE PAS';
    END IF;
    
    -- Vérifier patient_profiles
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'patient_profiles') THEN
        SELECT rowsecurity INTO rls_enabled 
        FROM pg_tables 
        WHERE tablename = 'patient_profiles';
        
        SELECT COUNT(*) INTO policy_count 
        FROM pg_policies 
        WHERE tablename = 'patient_profiles';
        
        RAISE NOTICE 'patient_profiles:';
        RAISE NOTICE '  - RLS activé: %', CASE WHEN rls_enabled THEN 'OUI' ELSE 'NON' END;
        RAISE NOTICE '  - Politiques: %', policy_count;
    ELSE
        RAISE NOTICE 'patient_profiles: VUE N''EXISTE PAS';
    END IF;
    
    -- Vérifier user_profiles (si elle existe)
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_profiles') THEN
        SELECT rowsecurity INTO rls_enabled 
        FROM pg_tables 
        WHERE tablename = 'user_profiles';
        
        SELECT COUNT(*) INTO policy_count 
        FROM pg_policies 
        WHERE tablename = 'user_profiles';
        
        RAISE NOTICE 'user_profiles:';
        RAISE NOTICE '  - RLS activé: %', CASE WHEN rls_enabled THEN 'OUI' ELSE 'NON' END;
        RAISE NOTICE '  - Politiques: %', policy_count;
    ELSE
        RAISE NOTICE 'user_profiles: VUE N''EXISTE PAS';
    END IF;
    
    -- Vérifier user_stats (si elle existe)
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_stats') THEN
        SELECT rowsecurity INTO rls_enabled 
        FROM pg_tables 
        WHERE tablename = 'user_stats';
        
        SELECT COUNT(*) INTO policy_count 
        FROM pg_policies 
        WHERE tablename = 'user_stats';
        
        RAISE NOTICE 'user_stats:';
        RAISE NOTICE '  - RLS activé: %', CASE WHEN rls_enabled THEN 'OUI' ELSE 'NON' END;
        RAISE NOTICE '  - Politiques: %', policy_count;
    ELSE
        RAISE NOTICE 'user_stats: VUE N''EXISTE PAS';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- 3. Afficher les politiques existantes sur les vues
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '🔍 POLITIQUES EXISTANTES SUR LES VUES';
    RAISE NOTICE '=====================================================';
    
    FOR policy_record IN 
        SELECT 
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE tablename IN ('nutritionist_profiles', 'patient_profiles', 'user_profiles', 'user_stats')
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE 'Table: % | Politique: % | Commande: %', 
            policy_record.tablename, 
            policy_record.policyname, 
            policy_record.cmd;
    END LOOP;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename IN ('nutritionist_profiles', 'patient_profiles', 'user_profiles', 'user_stats')
    ) THEN
        RAISE NOTICE 'Aucune politique trouvée sur ces vues';
    END IF;
    
    RAISE NOTICE '';
END $$;
