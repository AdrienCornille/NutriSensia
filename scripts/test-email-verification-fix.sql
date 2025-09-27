-- =====================================================
-- SCRIPT DE TEST - VÉRIFICATION D'EMAIL
-- Pour tester que la correction fonctionne correctement
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER QUE LE TRIGGER EXISTE
-- =====================================================

-- Vérifier que le trigger a été créé
SELECT 
    'VÉRIFICATION DU TRIGGER' as titre,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_email_confirmed'
AND event_object_table = 'users'
AND event_object_schema = 'auth';

-- =====================================================
-- ÉTAPE 2: VÉRIFIER QUE LA FONCTION EXISTE
-- =====================================================

-- Vérifier que la fonction de gestion existe
SELECT 
    'VÉRIFICATION DE LA FONCTION' as titre,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_email_confirmation'
AND routine_schema = 'public';

-- =====================================================
-- ÉTAPE 3: TEST DE SYNCHRONISATION MANUEL
-- =====================================================

-- Créer une fonction de test pour simuler une confirmation d'email
CREATE OR REPLACE FUNCTION test_email_confirmation_sync()
RETURNS void AS $$
DECLARE
    test_user_id UUID;
    test_email TEXT := 'test-verification@nutrisensia.ch';
    before_verified BOOLEAN;
    after_verified BOOLEAN;
BEGIN
    RAISE NOTICE '🧪 Test de synchronisation de la vérification d''email...';
    
    -- Trouver un utilisateur existant pour le test
    SELECT id INTO test_user_id 
    FROM profiles 
    WHERE email_verified = FALSE 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '⚠️ Aucun utilisateur non vérifié trouvé pour le test';
        RETURN;
    END IF;
    
    -- Récupérer l'email de l'utilisateur de test
    SELECT email INTO test_email FROM profiles WHERE id = test_user_id;
    
    RAISE NOTICE '👤 Utilisateur de test: % (%)', test_email, test_user_id;
    
    -- Vérifier l'état avant
    SELECT email_verified INTO before_verified 
    FROM profiles 
    WHERE id = test_user_id;
    
    RAISE NOTICE '📋 État avant: email_verified = %', before_verified;
    
    -- Simuler une confirmation d'email en mettant à jour auth.users
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = test_user_id 
    AND email_confirmed_at IS NULL;
    
    -- Attendre un moment pour que le trigger se déclenche
    PERFORM pg_sleep(1);
    
    -- Vérifier l'état après
    SELECT email_verified INTO after_verified 
    FROM profiles 
    WHERE id = test_user_id;
    
    RAISE NOTICE '📋 État après: email_verified = %', after_verified;
    
    -- Vérifier le résultat
    IF after_verified = TRUE THEN
        RAISE NOTICE '✅ TEST RÉUSSI: La synchronisation fonctionne!';
    ELSE
        RAISE NOTICE '❌ TEST ÉCHOUÉ: La synchronisation ne fonctionne pas';
    END IF;
    
    -- Remettre l'utilisateur dans son état initial pour ne pas affecter les données
    UPDATE auth.users 
    SET email_confirmed_at = NULL
    WHERE id = test_user_id;
    
    UPDATE profiles 
    SET email_verified = before_verified
    WHERE id = test_user_id;
    
    RAISE NOTICE '🔄 État restauré pour l''utilisateur de test';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Exécuter le test
SELECT test_email_confirmation_sync();

-- =====================================================
-- ÉTAPE 4: VÉRIFICATION DE LA COHÉRENCE GLOBALE
-- =====================================================

-- Vérifier qu'il n'y a plus d'incohérences
SELECT 
    'VÉRIFICATION DE COHÉRENCE' as titre,
    COUNT(*) as "Total des profils",
    COUNT(*) FILTER (WHERE 
        email_verified = (u.email_confirmed_at IS NOT NULL)
    ) as "Profils cohérents",
    COUNT(*) FILTER (WHERE 
        email_verified != (u.email_confirmed_at IS NOT NULL)
    ) as "Profils incohérents",
    CASE 
        WHEN COUNT(*) FILTER (WHERE 
            email_verified != (u.email_confirmed_at IS NOT NULL)
        ) = 0 THEN '✅ TOUS COHÉRENTS'
        ELSE '❌ INCOHÉRENCES DÉTECTÉES'
    END as "Résultat"
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id;

-- =====================================================
-- ÉTAPE 5: AFFICHAGE DES DÉTAILS DES INCOHÉRENCES (SI IL Y EN A)
-- =====================================================

-- Afficher les détails des incohérences restantes
SELECT 
    'DÉTAILS DES INCOHÉRENCES' as titre,
    p.id,
    p.email,
    p.email_verified as "Profile vérifié",
    (u.email_confirmed_at IS NOT NULL) as "Auth confirmé",
    u.email_confirmed_at as "Date de confirmation"
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email_verified != (u.email_confirmed_at IS NOT NULL)
ORDER BY p.created_at DESC;

-- =====================================================
-- ÉTAPE 6: NETTOYAGE - Supprimer la fonction de test
-- =====================================================

-- Supprimer la fonction de test
DROP FUNCTION IF EXISTS test_email_confirmation_sync();

-- =====================================================
-- RÉSUMÉ DU TEST
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT DE TEST :

1. **Vérification du trigger** : S'assure que le trigger a été créé
2. **Vérification de la fonction** : S'assure que la fonction existe
3. **Test de synchronisation** : Simule une confirmation d'email
4. **Vérification de cohérence** : Vérifie qu'il n'y a plus d'incohérences
5. **Affichage des détails** : Montre les incohérences restantes (s'il y en a)
6. **Nettoyage** : Supprime les fonctions de test

🔧 COMMENT L'UTILISER :

1. Exécutez d'abord le script "quick-fix-email-verification.sql"
2. Puis exécutez le script "fix-email-verification-sync.sql"
3. Enfin, exécutez ce script de test pour vérifier

✅ RÉSULTAT ATTENDU :

- Le trigger doit exister
- La fonction doit exister
- Le test de synchronisation doit réussir
- Tous les profils doivent être cohérents
- Aucune incohérence ne doit être détectée

⚠️ SI LE TEST ÉCHOUE :

- Vérifiez que les scripts précédents ont été exécutés
- Vérifiez les permissions de la base de données
- Contactez le support si le problème persiste
*/
