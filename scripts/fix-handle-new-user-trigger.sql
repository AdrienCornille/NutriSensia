-- =====================================================
-- FIX: Trigger handle_new_user qui échoue lors de l'inscription Google OAuth
-- Erreur: "Database error saving new user"
-- =====================================================

-- ÉTAPE 1: Vérifier la structure actuelle de la table profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ÉTAPE 2: Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ÉTAPE 3: Recréer la fonction handle_new_user avec une version robuste
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer le profil avec gestion d'erreur robuste
    -- Utiliser uniquement les colonnes qui existent certainement
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            role,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;  -- Ignorer si le profil existe déjà

        RAISE NOTICE '✅ Profil créé pour: %', NEW.email;

    EXCEPTION
        WHEN undefined_column THEN
            -- Si des colonnes manquent, faire une insertion minimale
            INSERT INTO public.profiles (id, email, role)
            VALUES (NEW.id, NEW.email, 'patient')
            ON CONFLICT (id) DO NOTHING;
            RAISE NOTICE '⚠️ Profil minimal créé pour: %', NEW.email;
        WHEN OTHERS THEN
            -- Log l'erreur mais ne pas faire échouer l'inscription
            RAISE WARNING 'Erreur création profil pour %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
            -- Ne pas propager l'erreur pour permettre l'inscription
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ÉTAPE 4: Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ÉTAPE 5: Vérification
SELECT
    'Trigger recréé avec succès' as status,
    tgname as trigger_name,
    tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- =====================================================
-- ALTERNATIVE: Si le problème persiste, désactiver temporairement le trigger
-- =====================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--
-- Puis créer les profils manuellement via l'API /api/auth/create-oauth-profile
-- =====================================================
