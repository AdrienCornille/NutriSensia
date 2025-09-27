-- =====================================================
-- Diagnostic des Fonctions - NutriSensia
-- =====================================================

-- Lister toutes les fonctions existantes
DO $$
DECLARE
    func_record RECORD;
    func_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 DIAGNOSTIC DES FONCTIONS EXISTANTES';
    RAISE NOTICE '=====================================================';
    
    FOR func_record IN 
        SELECT 
            routine_name,
            routine_type,
            data_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        ORDER BY routine_name
    LOOP
        func_count := func_count + 1;
        RAISE NOTICE 'Fonction %: % (%) - Type retour: %', 
            func_count, 
            func_record.routine_name, 
            func_record.routine_type,
            func_record.data_type;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 TOTAL: % fonctions trouvées', func_count;
    RAISE NOTICE '';
    
    -- Vérifier spécifiquement nos fonctions attendues
    RAISE NOTICE '🔍 VÉRIFICATION DES FONCTIONS ATTENDUES';
    RAISE NOTICE '=====================================================';
    
    -- get_user_profile
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_profile') THEN
        RAISE NOTICE '✅ get_user_profile - PRÉSENTE';
    ELSE
        RAISE NOTICE '❌ get_user_profile - MANQUANTE';
    END IF;
    
    -- calculate_age
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'calculate_age') THEN
        RAISE NOTICE '✅ calculate_age - PRÉSENTE';
    ELSE
        RAISE NOTICE '❌ calculate_age - MANQUANTE';
    END IF;
    
    -- update_updated_at_column
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_updated_at_column') THEN
        RAISE NOTICE '✅ update_updated_at_column - PRÉSENTE';
    ELSE
        RAISE NOTICE '❌ update_updated_at_column - MANQUANTE';
    END IF;
    
    -- handle_new_user
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') THEN
        RAISE NOTICE '✅ handle_new_user - PRÉSENTE';
    ELSE
        RAISE NOTICE '❌ handle_new_user - MANQUANTE';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔍 FONCTIONS SUPPLÉMENTAIRES (non attendues)';
    RAISE NOTICE '=====================================================';
    
    -- Lister les fonctions non attendues
    FOR func_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_name NOT IN ('get_user_profile', 'calculate_age', 'update_updated_at_column', 'handle_new_user')
        ORDER BY routine_name
    LOOP
        RAISE NOTICE '⚠️ Fonction supplémentaire: %', func_record.routine_name;
    END LOOP;
    
END $$;
