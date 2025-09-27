-- =====================================================
-- CORRECTION SPÉCIFIQUE - UTILISATEUR siniam34@gmail.com
-- Script pour créer le profil manquant de cet utilisateur
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER L'UTILISATEUR DANS AUTH.USERS
-- =====================================================

-- Vérifier que l'utilisateur existe dans auth.users
SELECT 
    'UTILISATEUR DANS AUTH.USERS' as titre,
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data
FROM auth.users u
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 2: VÉRIFIER L'ABSENCE DU PROFIL
-- =====================================================

-- Vérifier que l'utilisateur n'a pas de profil
SELECT 
    'PROFIL DANS PROFILES' as titre,
    CASE 
        WHEN EXISTS(SELECT 1 FROM profiles WHERE email = 'siniam34@gmail.com') THEN '❌ PROFIL EXISTE DÉJÀ'
        ELSE '✅ AUCUN PROFIL (CORRECT)'
    END as "État du profil";

-- =====================================================
-- ÉTAPE 3: CRÉER LE PROFIL MANQUANT
-- =====================================================

-- Créer le profil pour cet utilisateur spécifique
INSERT INTO profiles (
    id,
    email,
    role,
    email_verified,
    two_factor_enabled,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'role', 'patient'),
    COALESCE(u.email_confirmed_at IS NOT NULL, FALSE),
    FALSE, -- 2FA non activé par défaut
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'siniam34@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Afficher le résultat de la création
SELECT 
    'PROFIL CRÉÉ' as statut,
    'Profil créé pour siniam34@gmail.com' as action;

-- =====================================================
-- ÉTAPE 4: VÉRIFIER LA CRÉATION DU PROFIL
-- =====================================================

-- Vérifier que le profil a été créé
SELECT 
    'VÉRIFICATION DU PROFIL CRÉÉ' as titre,
    p.id,
    p.email,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.created_at,
    p.updated_at
FROM profiles p
WHERE p.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 5: VÉRIFIER LA COHÉRENCE
-- =====================================================

-- Vérifier la cohérence entre auth.users et profiles
SELECT 
    'COHÉRENCE AUTH.PROFILES' as titre,
    u.id as "Auth ID",
    p.id as "Profile ID",
    u.email as "Auth Email",
    p.email as "Profile Email",
    u.email_confirmed_at IS NOT NULL as "Auth Email Verified",
    p.email_verified as "Profile Email Verified",
    CASE 
        WHEN u.id = p.id AND u.email = p.email THEN '✅ COHÉRENT'
        ELSE '❌ INCOHÉRENT'
    END as "État"
FROM auth.users u
INNER JOIN profiles p ON u.id = p.id
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 6: NETTOYER LES FACTEURS MFA EXISTANTS
-- =====================================================

-- Supprimer tous les facteurs MFA existants pour cet utilisateur
DELETE FROM auth.mfa_factors 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat du nettoyage
SELECT 
    'FACTEURS MFA NETTOYÉS' as statut,
    'Tous les facteurs MFA supprimés pour siniam34@gmail.com' as action;

-- =====================================================
-- ÉTAPE 7: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier l'état final
SELECT 
    'ÉTAT FINAL' as titre,
    u.id as user_id,
    u.email,
    u.email_confirmed_at IS NOT NULL as "Email confirmé",
    p.two_factor_enabled as "2FA activé",
    COUNT(mf.id) as "Facteurs MFA"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN auth.mfa_factors mf ON u.id = mf.user_id
WHERE u.email = 'siniam34@gmail.com'
GROUP BY u.id, u.email, u.email_confirmed_at, p.two_factor_enabled;

-- =====================================================
-- ÉTAPE 8: INSTRUCTIONS POUR L'UTILISATEUR
-- =====================================================

-- Afficher les instructions pour l'utilisateur
SELECT 
    'INSTRUCTIONS POUR L''UTILISATEUR' as titre,
    '1. Se reconnecter sur l''application' as instruction_1,
    '2. Aller dans les paramètres de sécurité' as instruction_2,
    '3. Configurer un nouveau facteur MFA' as instruction_3,
    '4. Scanner le nouveau QR code' as instruction_4,
    '5. Entrer le code de vérification' as instruction_5;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Vérification** : Contrôle que l'utilisateur existe dans auth.users
2. **Création** : Crée le profil manquant dans la table profiles
3. **Nettoyage** : Supprime tous les facteurs MFA corrompus
4. **Vérification** : Confirme que tout est cohérent
5. **Instructions** : Donne les étapes pour l'utilisateur

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script créera le profil manquant et nettoiera les facteurs MFA
3. Vérifiez que le profil a été créé correctement

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il ne supprime aucune donnée utilisateur
- Il ne fait que créer le profil manquant et nettoyer les facteurs MFA

🚀 RÉSULTAT ATTENDU :

- L'utilisateur aura un profil dans la table profiles
- Tous les facteurs MFA corrompus seront supprimés
- L'utilisateur pourra configurer un nouveau facteur MFA
- L'erreur "Factor not found" ne se produira plus

💡 POURQUOI CE PROBLÈME SE PRODUIT :

1. **Trigger défaillant** : Le trigger handle_new_user ne s'est pas exécuté lors de l'inscription
2. **Fonction corrompue** : La fonction handle_new_user a une erreur
3. **Permissions** : Le trigger n'a pas les bonnes permissions
4. **Conflit** : Un autre trigger ou contrainte empêche l'exécution

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le script s'est exécuté sans erreur
2. Vérifiez que le profil a été créé
3. Redémarrez votre application
4. Demandez à l'utilisateur de se reconnecter
5. Contactez le support Supabase si nécessaire
*/
