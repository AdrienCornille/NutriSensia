-- =====================================================
-- Vérification Simple de la Sécurité RLS
-- =====================================================

-- 1. Vérifier RLS sur les tables principales
SELECT 
    tablename,
    rowsecurity as rls_activated,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ACTIVÉ'
        ELSE '❌ RLS DÉSACTIVÉ'
    END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'nutritionists', 'patients')
ORDER BY tablename;

-- 2. Compter les politiques RLS
SELECT 
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ POLITIQUES CONFIGURÉES'
        ELSE '❌ AUCUNE POLITIQUE'
    END as status
FROM pg_policies 
WHERE tablename IN ('profiles', 'nutritionists', 'patients')
GROUP BY tablename
ORDER BY tablename;

-- 3. Lister les vues existantes
SELECT 
    table_name as vue,
    '✅ VUE EXISTE' as status
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. Résumé de sécurité
SELECT 
    'SÉCURITÉ RLS' as verification,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename IN ('profiles', 'nutritionists', 'patients')
            AND rowsecurity = true
        ) THEN '✅ ACTIVÉE'
        ELSE '❌ DÉSACTIVÉE'
    END as status
UNION ALL
SELECT 
    'POLITIQUES CONFIGURÉES' as verification,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename IN ('profiles', 'nutritionists', 'patients')
        ) THEN '✅ OUI'
        ELSE '❌ NON'
    END as status
UNION ALL
SELECT 
    'VUES CRÉÉES' as verification,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_schema = 'public'
        ) THEN '✅ OUI'
        ELSE '❌ NON'
    END as status;
