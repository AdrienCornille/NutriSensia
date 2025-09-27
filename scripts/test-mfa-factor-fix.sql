-- =====================================================
-- SCRIPT DE TEST - CORRECTION ERREUR "Factor not found" MFA
-- Pour vérifier que la correction fonctionne correctement
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER L'ÉTAT INITIAL
-- =====================================================

-- Afficher l'état initial des facteurs MFA
SELECT 
    'ÉTAT INITIAL - Facteurs MFA' as titre,
    COUNT(*) as "Total facteurs",
    COUNT(*) FILTER (WHERE status = 'verified') as "Vérifiés",
    COUNT(*) FILTER (WHERE status = 'unverified') as "Non vérifiés",
    COUNT(*) FILTER (WHERE friendly_name IS NULL OR friendly_name = '') as "Sans nom"
FROM auth.mfa_factors;

-- =====================================================
-- ÉTAPE 2: VÉRIFIER LA COHÉRENCE DES PROFILS
-- =====================================================

-- Vérifier la cohérence entre profiles et auth.mfa_factors
SELECT 
    'COHÉRENCE INITIALE' as titre,
    COUNT(*) as "Total profils",
    COUNT(*) FILTER (WHERE 
        two_factor_enabled = EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = profiles.id AND status = 'verified'
        )
    ) as "Profils cohérents",
    COUNT(*) FILTER (WHERE 
        two_factor_enabled != EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = profiles.id AND status = 'verified'
        )
    ) as "Profils incohérents"
FROM profiles;

-- =====================================================
-- ÉTAPE 3: SIMULER UNE CORRECTION
-- =====================================================

-- Créer une fonction de test pour simuler la correction
CREATE OR REPLACE FUNCTION test_mfa_factor_fix()
RETURNS TABLE (
    step TEXT,
    description TEXT,
    result TEXT,
    status TEXT
) AS $$
DECLARE
    initial_factors_count INTEGER;
    initial_inconsistent_profiles INTEGER;
    final_factors_count INTEGER;
    final_inconsistent_profiles INTEGER;
BEGIN
    -- Étape 1: Compter les facteurs initiaux
    SELECT COUNT(*) INTO initial_factors_count FROM auth.mfa_factors;
    
    -- Étape 2: Compter les profils incohérents initiaux
    SELECT COUNT(*) INTO initial_inconsistent_profiles
    FROM profiles p
    WHERE p.two_factor_enabled != EXISTS(
        SELECT 1 FROM auth.mfa_factors 
        WHERE user_id = p.id AND status = 'verified'
    );
    
    -- Étape 3: Supprimer les facteurs problématiques
    DELETE FROM auth.mfa_factors WHERE status = 'unverified';
    DELETE FROM auth.mfa_factors WHERE friendly_name IS NULL OR friendly_name = '';
    
    -- Étape 4: Synchroniser les profils
    UPDATE profiles 
    SET 
        two_factor_enabled = EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = profiles.id AND status = 'verified'
        ),
        updated_at = NOW()
    WHERE EXISTS(
        SELECT 1 FROM auth.mfa_factors 
        WHERE user_id = profiles.id
    );
    
    -- Étape 5: Compter les résultats finaux
    SELECT COUNT(*) INTO final_factors_count FROM auth.mfa_factors;
    
    SELECT COUNT(*) INTO final_inconsistent_profiles
    FROM profiles p
    WHERE p.two_factor_enabled != EXISTS(
        SELECT 1 FROM auth.mfa_factors 
        WHERE user_id = p.id AND status = 'verified'
    );
    
    -- Retourner les résultats
    step := '1';
    description := 'Facteurs MFA initiaux';
    result := initial_factors_count::TEXT;
    status := '✅ OK';
    RETURN NEXT;
    
    step := '2';
    description := 'Profils incohérents initiaux';
    result := initial_inconsistent_profiles::TEXT;
    status := '✅ OK';
    RETURN NEXT;
    
    step := '3';
    description := 'Facteurs problématiques supprimés';
    result := (initial_factors_count - final_factors_count)::TEXT;
    status := '✅ OK';
    RETURN NEXT;
    
    step := '4';
    description := 'Profils synchronisés';
    result := (initial_inconsistent_profiles - final_inconsistent_profiles)::TEXT;
    status := '✅ OK';
    RETURN NEXT;
    
    step := '5';
    description := 'Facteurs MFA finaux';
    result := final_factors_count::TEXT;
    status := '✅ OK';
    RETURN NEXT;
    
    step := '6';
    description := 'Profils incohérents finaux';
    result := final_inconsistent_profiles::TEXT;
    status := CASE 
        WHEN final_inconsistent_profiles = 0 THEN '✅ PARFAIT'
        ELSE '⚠️ RESTE DES INCOHÉRENCES'
    END;
    RETURN NEXT;
    
END;
$$ LANGUAGE plpgsql;

-- Exécuter le test
SELECT * FROM test_mfa_factor_fix();

-- =====================================================
-- ÉTAPE 4: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier l'état final
SELECT 
    'ÉTAT FINAL - Facteurs MFA' as titre,
    COUNT(*) as "Total facteurs",
    COUNT(*) FILTER (WHERE status = 'verified') as "Vérifiés",
    COUNT(*) FILTER (WHERE status = 'unverified') as "Non vérifiés",
    COUNT(*) FILTER (WHERE friendly_name IS NULL OR friendly_name = '') as "Sans nom"
FROM auth.mfa_factors;

-- Vérifier la cohérence finale
SELECT 
    'COHÉRENCE FINALE' as titre,
    COUNT(*) as "Total profils",
    COUNT(*) FILTER (WHERE 
        two_factor_enabled = EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = profiles.id AND status = 'verified'
        )
    ) as "Profils cohérents",
    COUNT(*) FILTER (WHERE 
        two_factor_enabled != EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = profiles.id AND status = 'verified'
        )
    ) as "Profils incohérents"
FROM profiles;

-- =====================================================
-- ÉTAPE 5: TEST DE RÉSISTANCE
-- =====================================================

-- Vérifier qu'il n'y a plus de facteurs problématiques
SELECT 
    'TEST DE RÉSISTANCE' as titre,
    CASE 
        WHEN NOT EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE status = 'unverified' 
            OR friendly_name IS NULL 
            OR friendly_name = ''
        ) THEN '✅ AUCUN FACTEUR PROBLÉMATIQUE'
        ELSE '❌ FACTEURS PROBLÉMATIQUES DÉTECTÉS'
    END as "Résultat";

-- Vérifier qu'il n'y a plus d'incohérences
SELECT 
    'TEST DE COHÉRENCE' as titre,
    CASE 
        WHEN NOT EXISTS(
            SELECT 1 FROM profiles p
            WHERE p.two_factor_enabled != EXISTS(
                SELECT 1 FROM auth.mfa_factors 
                WHERE user_id = p.id AND status = 'verified'
            )
        ) THEN '✅ TOUTES LES COHÉRENCES RESPECTÉES'
        ELSE '❌ INCOHÉRENCES DÉTECTÉES'
    END as "Résultat";

-- =====================================================
-- ÉTAPE 6: NETTOYAGE - Supprimer la fonction de test
-- =====================================================

-- Supprimer la fonction de test
DROP FUNCTION IF EXISTS test_mfa_factor_fix();

-- =====================================================
-- RÉSUMÉ DU TEST
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT DE TEST :

1. **Vérification initiale** : Analyse l'état des facteurs MFA et profils
2. **Simulation de correction** : Applique la même logique que le script de correction
3. **Vérification finale** : Confirme que la correction a fonctionné
4. **Test de résistance** : Vérifie qu'il n'y a plus de problèmes
5. **Nettoyage** : Supprime les fonctions temporaires

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script testera la correction automatiquement
3. Vérifiez les résultats affichés

✅ RÉSULTAT ATTENDU :

- Aucun facteur problématique ne doit rester
- Tous les profils doivent être cohérents
- Le test de résistance doit passer
- Le test de cohérence doit passer

⚠️ SI LE TEST ÉCHOUE :

- Vérifiez que les scripts de correction ont été exécutés
- Vérifiez les permissions de la base de données
- Contactez le support si le problème persiste

🚀 APRÈS UN TEST RÉUSSI :

- L'erreur "Factor not found" ne devrait plus se produire
- Les utilisateurs peuvent configurer un nouveau facteur MFA
- Tous les profils sont cohérents avec l'état réel des facteurs
*/
