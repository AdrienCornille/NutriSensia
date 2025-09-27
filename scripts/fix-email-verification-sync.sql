-- =====================================================
-- SCRIPT POUR CORRIGER LA SYNCHRONISATION DE LA VÉRIFICATION D'EMAIL
-- NutriSensia - Problème: email_verified reste FALSE même après vérification
-- =====================================================

-- =====================================================
-- ÉTAPE 1: CRÉER UN TRIGGER POUR SYNCHRONISER AUTOMATIQUEMENT
-- =====================================================

-- Fonction pour mettre à jour email_verified quand l'utilisateur confirme son email
CREATE OR REPLACE FUNCTION handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'email vient d'être confirmé (email_confirmed_at est maintenant non-null)
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        -- Mettre à jour le profil pour marquer l'email comme vérifié
        UPDATE public.profiles 
        SET 
            email_verified = TRUE,
            updated_at = NOW()
        WHERE id = NEW.id;
        
        RAISE NOTICE '✅ Email vérifié pour l''utilisateur: %', NEW.email;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer la confirmation d'email
        RAISE WARNING 'Erreur lors de la mise à jour du profil après confirmation d''email pour l''utilisateur %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table auth.users
-- Ce trigger se déclenche quand email_confirmed_at change
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_email_confirmation();

-- =====================================================
-- ÉTAPE 2: FONCTION POUR CORRIGER LES UTILISATEURS EXISTANTS
-- =====================================================

-- Fonction pour synchroniser tous les profils existants
CREATE OR REPLACE FUNCTION sync_all_email_verification()
RETURNS void AS $$
DECLARE
    profile_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Synchronisation de la vérification d''email pour tous les profils...';
    
    -- Parcourir tous les profils
    FOR profile_record IN 
        SELECT p.id, p.email, p.email_verified as current_verified
        FROM profiles p
        LEFT JOIN auth.users u ON p.id = u.id
    LOOP
        -- Vérifier si l'email est confirmé dans auth.users
        IF EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = profile_record.id 
            AND email_confirmed_at IS NOT NULL
        ) THEN
            -- Mettre à jour le profil si nécessaire
            UPDATE profiles 
            SET 
                email_verified = TRUE,
                updated_at = NOW()
            WHERE id = profile_record.id 
            AND email_verified = FALSE;
            
            -- Compter les mises à jour
            IF FOUND THEN
                updated_count := updated_count + 1;
                RAISE NOTICE '✅ Profil mis à jour: % (email maintenant vérifié)', profile_record.email;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE '🎉 Synchronisation terminée! % profils mis à jour.', updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÉTAPE 3: FONCTION POUR VÉRIFIER L'ÉTAT DE SYNCHRONISATION
-- =====================================================

-- Fonction pour diagnostiquer les incohérences
CREATE OR REPLACE FUNCTION diagnose_email_verification()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    profile_email_verified BOOLEAN,
    auth_email_verified BOOLEAN,
    is_consistent BOOLEAN,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.email,
        p.email_verified as profile_email_verified,
        (u.email_confirmed_at IS NOT NULL) as auth_email_verified,
        (p.email_verified = (u.email_confirmed_at IS NOT NULL)) as is_consistent,
        CASE 
            WHEN p.email_verified = (u.email_confirmed_at IS NOT NULL) THEN '✅ Cohérent'
            WHEN p.email_verified = FALSE AND u.email_confirmed_at IS NOT NULL THEN '❌ Email confirmé mais profil non mis à jour'
            WHEN p.email_verified = TRUE AND u.email_confirmed_at IS NULL THEN '❌ Profil marqué vérifié mais email non confirmé'
            ELSE '❓ État inconnu'
        END as status
    FROM profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÉTAPE 4: EXÉCUTION AUTOMATIQUE
-- =====================================================

-- Exécuter la synchronisation pour corriger les utilisateurs existants
SELECT sync_all_email_verification();

-- Afficher le diagnostic final
SELECT * FROM diagnose_email_verification();

-- =====================================================
-- ÉTAPE 5: VÉRIFICATION FINALE
-- =====================================================

-- Afficher un résumé des profils
SELECT 
    'Résumé de la vérification d''email' as titre,
    COUNT(*) as total_profils,
    COUNT(*) FILTER (WHERE email_verified = TRUE) as emails_verifies,
    COUNT(*) FILTER (WHERE email_verified = FALSE) as emails_non_verifies,
    ROUND(
        (COUNT(*) FILTER (WHERE email_verified = TRUE)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as pourcentage_verifies
FROM profiles;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Trigger automatique** : Crée un trigger qui se déclenche automatiquement 
   quand un utilisateur confirme son email dans Supabase

2. **Correction des utilisateurs existants** : Synchronise tous les profils 
   existants qui ont déjà confirmé leur email

3. **Diagnostic** : Fournit des fonctions pour vérifier l'état de synchronisation

4. **Sécurité** : Le trigger ne fait pas échouer la confirmation d'email 
   même en cas d'erreur

🔧 COMMENT UTILISER :

1. Exécutez ce script dans votre base de données Supabase
2. Le script corrigera automatiquement tous les utilisateurs existants
3. À partir de maintenant, chaque nouvelle vérification d'email sera 
   automatiquement synchronisée

🧪 POUR TESTER :

1. Créez un nouvel utilisateur de test
2. Vérifiez que email_verified = FALSE au début
3. Confirmez l'email via le lien reçu
4. Vérifiez que email_verified = TRUE automatiquement

⚠️ IMPORTANT :

- Ce script est sûr à exécuter en production
- Il ne supprime aucune donnée
- Il ne fait que synchroniser les états existants
*/
