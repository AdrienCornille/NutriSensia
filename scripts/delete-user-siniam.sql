-- =====================================================
-- SUPPRESSION UTILISATEUR - siniam34@gmail.com
-- Script pour supprimer complètement l'utilisateur et résoudre les contraintes
-- =====================================================

-- =====================================================
-- ÉTAPE 1: DIAGNOSTIC - Identifier l'utilisateur et ses dépendances
-- =====================================================

-- Vérifier que l'utilisateur existe
SELECT 
    'UTILISATEUR À SUPPRIMER' as titre,
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 2: IDENTIFIER LES CONTRAINTES DE CLÉS ÉTRANGÈRES
-- =====================================================

-- Vérifier les contraintes de clés étrangères qui référencent cet utilisateur
SELECT 
    'CONTRAINTES DE CLÉS ÉTRANGÈRES' as titre,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND ccu.column_name = 'id'
    AND tc.table_schema = 'auth';

-- =====================================================
-- ÉTAPE 3: IDENTIFIER LES DONNÉES LIÉES
-- =====================================================

-- Vérifier les données dans la table profiles
SELECT 
    'DONNÉES DANS PROFILES' as titre,
    COUNT(*) as "Nombre d'entrées"
FROM profiles p
WHERE p.id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Vérifier les données dans la table nutritionists
SELECT 
    'DONNÉES DANS NUTRITIONISTS' as titre,
    COUNT(*) as "Nombre d'entrées"
FROM nutritionists n
WHERE n.id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Vérifier les données dans la table patients
SELECT 
    'DONNÉES DANS PATIENTS' as titre,
    COUNT(*) as "Nombre d'entrées"
FROM patients p
WHERE p.id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Vérifier les facteurs MFA
SELECT 
    'FACTEURS MFA' as titre,
    COUNT(*) as "Nombre de facteurs"
FROM auth.mfa_factors mf
WHERE mf.user_id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- =====================================================
-- ÉTAPE 4: SUPPRIMER LES DONNÉES LIÉES
-- =====================================================

-- Supprimer les facteurs MFA
DELETE FROM auth.mfa_factors 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat
SELECT 
    'FACTEURS MFA SUPPRIMÉS' as statut,
    'Tous les facteurs MFA supprimés' as action;

-- Supprimer les données dans la table patients
DELETE FROM patients 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat
SELECT 
    'DONNÉES PATIENTS SUPPRIMÉES' as statut,
    'Toutes les données patients supprimées' as action;

-- Supprimer les données dans la table nutritionists
DELETE FROM nutritionists 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat
SELECT 
    'DONNÉES NUTRITIONISTS SUPPRIMÉES' as statut,
    'Toutes les données nutritionists supprimées' as action;

-- Supprimer les données dans la table profiles
DELETE FROM profiles 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat
SELECT 
    'DONNÉES PROFILES SUPPRIMÉES' as statut,
    'Toutes les données profiles supprimées' as action;

-- =====================================================
-- ÉTAPE 5: VÉRIFIER QU'IL N'Y A PLUS DE DONNÉES LIÉES
-- =====================================================

-- Vérifier qu'il n'y a plus de données liées
SELECT 
    'VÉRIFICATION FINALE' as titre,
    'Profiles' as table_name,
    COUNT(*) as "Entrées restantes"
FROM profiles p
WHERE p.id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
)
UNION ALL
SELECT 
    'VÉRIFICATION FINALE' as titre,
    'Nutritionists' as table_name,
    COUNT(*) as "Entrées restantes"
FROM nutritionists n
WHERE n.id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
)
UNION ALL
SELECT 
    'VÉRIFICATION FINALE' as titre,
    'Patients' as table_name,
    COUNT(*) as "Entrées restantes"
FROM patients p
WHERE p.id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
)
UNION ALL
SELECT 
    'VÉRIFICATION FINALE' as titre,
    'MFA Factors' as table_name,
    COUNT(*) as "Entrées restantes"
FROM auth.mfa_factors mf
WHERE mf.user_id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- =====================================================
-- ÉTAPE 6: SUPPRIMER L'UTILISATEUR
-- =====================================================

-- Supprimer l'utilisateur de la table auth.users
DELETE FROM auth.users 
WHERE email = 'siniam34@gmail.com';

-- Afficher le résultat
SELECT 
    'UTILISATEUR SUPPRIMÉ' as statut,
    'Utilisateur siniam34@gmail.com supprimé de auth.users' as action;

-- =====================================================
-- ÉTAPE 7: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que l'utilisateur a été supprimé
SELECT 
    'VÉRIFICATION FINALE' as titre,
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'siniam34@gmail.com') THEN '❌ UTILISATEUR ENCORE PRÉSENT'
        ELSE '✅ UTILISATEUR SUPPRIMÉ'
    END as "Résultat";

-- =====================================================
-- ÉTAPE 8: NETTOYAGE DES TRIGGERS PROBLÉMATIQUES (SI NÉCESSAIRE)
-- =====================================================

-- Si des erreurs persistent, supprimer les triggers problématiques
-- Décommentez les lignes suivantes si nécessaire :

/*
-- Supprimer le trigger handle_new_user s'il cause des problèmes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recréer le trigger si nécessaire
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        role,
        email_verified,
        two_factor_enabled,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        FALSE,
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
*/

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Diagnostic** : Identifie l'utilisateur et ses dépendances
2. **Identification des contraintes** : Trouve les contraintes de clés étrangères
3. **Suppression des données liées** : Supprime toutes les données liées à cet utilisateur
4. **Suppression de l'utilisateur** : Supprime l'utilisateur de auth.users
5. **Vérification** : Confirme que la suppression a réussi

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script supprimera complètement l'utilisateur et toutes ses données
3. Vérifiez que la suppression a réussi

⚠️ IMPORTANT :

- Ce script supprime DÉFINITIVEMENT l'utilisateur et toutes ses données
- Assurez-vous de vouloir supprimer cet utilisateur avant d'exécuter
- Faites une sauvegarde si nécessaire

🚀 RÉSULTAT ATTENDU :

- L'utilisateur sera complètement supprimé de la base de données
- Toutes les données liées seront supprimées
- Plus d'erreur "Database error loading user"

💡 POURQUOI CETTE ERREUR SE PRODUIT :

1. **Contraintes de clés étrangères** : D'autres tables référencent cet utilisateur
2. **Données liées** : L'utilisateur a des données dans d'autres tables
3. **Triggers** : Des triggers empêchent la suppression
4. **Permissions** : Problèmes de permissions sur les tables

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le script s'est exécuté sans erreur
2. Vérifiez que l'utilisateur a été supprimé
3. Décommentez la section de nettoyage des triggers si nécessaire
4. Contactez le support Supabase si nécessaire
*/
