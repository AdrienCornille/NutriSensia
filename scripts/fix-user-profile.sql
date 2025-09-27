-- =====================================================
-- SCRIPT POUR VÉRIFIER ET CRÉER LE PROFIL DE L'UTILISATEUR
-- =====================================================

-- ID de l'utilisateur Lucie (extrait de la session)
DO $$
DECLARE
    user_id UUID := 'e2143066-6067-4af5-90d3-beca62b46f76';
    user_email TEXT := 'lucie.perez90@gmail.com';
    user_name TEXT := 'Lucie Cornille';
    user_role TEXT := 'nutritionist';
    profile_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 Vérification du profil pour l''utilisateur: %', user_email;
    
    -- Vérifier si l'utilisateur existe dans auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        RAISE NOTICE '✅ Utilisateur trouvé dans auth.users';
    ELSE
        RAISE NOTICE '❌ Utilisateur NON trouvé dans auth.users';
        RETURN;
    END IF;
    
    -- Vérifier si le profil existe
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE '✅ Profil existe déjà dans la table profiles';
        
        -- Afficher les informations du profil
        RAISE NOTICE '📋 Informations du profil:';
        RAISE NOTICE '   - Email: %', (SELECT email FROM profiles WHERE id = user_id);
        RAISE NOTICE '   - Nom: %', (SELECT full_name FROM profiles WHERE id = user_id);
        RAISE NOTICE '   - Rôle: %', (SELECT role FROM profiles WHERE id = user_id);
        RAISE NOTICE '   - Email vérifié: %', (SELECT email_verified FROM profiles WHERE id = user_id);
        
    ELSE
        RAISE NOTICE '❌ Profil manquant - création en cours...';
        
        -- Créer le profil manquant
        INSERT INTO profiles (
            id,
            email,
            full_name,
            role,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            user_email,
            user_name,
            user_role,
            TRUE, -- email_verified
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Profil créé avec succès!';
        
        -- Vérifier que le profil a été créé
        IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
            RAISE NOTICE '✅ Vérification: profil maintenant présent';
        ELSE
            RAISE NOTICE '❌ Erreur: profil non créé';
        END IF;
    END IF;
    
    -- Vérifier aussi la table users
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
        RAISE NOTICE '✅ Entrée trouvée dans la table users';
    ELSE
        RAISE NOTICE '⚠️ Entrée manquante dans la table users - création...';
        
        INSERT INTO users (id, email, created_at, updated_at)
        VALUES (user_id, user_email, NOW(), NOW());
        
        RAISE NOTICE '✅ Entrée users créée';
    END IF;
    
END $$;

-- Afficher tous les profils pour vérification
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.email_verified,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅'
        ELSE '❌'
    END as users_table_exists
FROM profiles p
LEFT JOIN users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Vérifier les permissions RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- Test de lecture du profil (simulation de l'application)
DO $$
DECLARE
    user_id UUID := 'e2143066-6067-4af5-90d3-beca62b46f76';
    profile_data RECORD;
BEGIN
    RAISE NOTICE '🧪 Test de lecture du profil...';
    
    SELECT * INTO profile_data FROM profiles WHERE id = user_id;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Lecture réussie:';
        RAISE NOTICE '   - Email: %', profile_data.email;
        RAISE NOTICE '   - Nom: %', profile_data.full_name;
        RAISE NOTICE '   - Rôle: %', profile_data.role;
    ELSE
        RAISE NOTICE '❌ Lecture échouée: profil non trouvé';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors de la lecture: %', SQLERRM;
END $$;

-- Messages de fin
DO $$
BEGIN
    RAISE NOTICE '🔧 SCRIPT TERMINÉ';
    RAISE NOTICE '💡 Si le profil a été créé, essayez maintenant d''accéder à /profile';
    RAISE NOTICE '🛠️ Si le problème persiste, vérifiez les logs du middleware';
END $$;
