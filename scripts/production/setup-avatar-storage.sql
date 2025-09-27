-- Script de configuration du bucket de stockage pour les avatars
-- À exécuter dans l'interface SQL de Supabase

-- 1. Créer le bucket 'avatars' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique pour permettre aux utilisateurs authentifiés de télécharger leurs propres avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique pour permettre aux utilisateurs authentifiés de voir tous les avatars (public)
CREATE POLICY "Users can view all avatars" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- 4. Politique pour permettre aux utilisateurs de mettre à jour leurs propres avatars
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Politique pour permettre aux utilisateurs de supprimer leurs propres avatars
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Politique pour permettre l'accès public en lecture seule aux avatars
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- 7. Fonction pour nettoyer automatiquement les anciens avatars lors de la mise à jour
CREATE OR REPLACE FUNCTION handle_avatar_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur a un ancien avatar, le supprimer
  IF OLD.avatar_url IS NOT NULL AND NEW.avatar_url != OLD.avatar_url THEN
    -- Extraire le chemin du fichier de l'URL
    -- Format attendu: https://xxx.supabase.co/storage/v1/object/public/avatars/users/user-id/filename
    DECLARE
      file_path text;
    BEGIN
      -- Extraire le chemin après 'avatars/'
      file_path := substring(OLD.avatar_url from 'avatars/(.*)');
      
      IF file_path IS NOT NULL THEN
        -- Supprimer l'ancien fichier
        DELETE FROM storage.objects 
        WHERE bucket_id = 'avatars' 
        AND name = file_path;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorer les erreurs de suppression
        NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Déclencheur pour automatiquement nettoyer les anciens avatars
DROP TRIGGER IF EXISTS avatar_update_trigger ON public.profiles;
CREATE TRIGGER avatar_update_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_avatar_update();

-- 9. Fonction pour nettoyer les avatars orphelins (optionnel)
CREATE OR REPLACE FUNCTION cleanup_orphaned_avatars()
RETURNS void AS $$
BEGIN
  -- Supprimer les fichiers qui n'ont plus de référence dans la table profiles
  DELETE FROM storage.objects 
  WHERE bucket_id = 'avatars'
  AND name NOT IN (
    SELECT substring(avatar_url from 'avatars/(.*)')
    FROM public.profiles 
    WHERE avatar_url IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Index pour améliorer les performances des requêtes sur les avatars
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON public.profiles(avatar_url);

-- 11. Contrainte pour s'assurer que l'URL de l'avatar est valide
ALTER TABLE public.profiles 
ADD CONSTRAINT check_avatar_url_format 
CHECK (
  avatar_url IS NULL OR 
  avatar_url ~ '^https://.*\.supabase\.co/storage/v1/object/public/avatars/'
);

-- 12. Fonction pour obtenir l'URL publique d'un avatar
CREATE OR REPLACE FUNCTION get_avatar_url(user_id uuid)
RETURNS text AS $$
DECLARE
  avatar_url text;
BEGIN
  SELECT p.avatar_url INTO avatar_url
  FROM public.profiles p
  WHERE p.id = user_id;
  
  RETURN COALESCE(avatar_url, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Fonction pour mettre à jour l'avatar d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_avatar(user_id uuid, new_avatar_url text)
RETURNS boolean AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    avatar_url = new_avatar_url,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Politique RLS pour la table profiles (si pas déjà configurée)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs de voir tous les profils (pour les avatars)
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- Permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 15. Vues utiles pour la gestion des avatars
CREATE OR REPLACE VIEW avatar_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(avatar_url) as users_with_avatar,
  ROUND(
    (COUNT(avatar_url)::decimal / COUNT(*)) * 100, 
    2
  ) as avatar_percentage
FROM public.profiles;

-- 16. Fonction pour obtenir les statistiques d'utilisation du stockage
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE(
  bucket_name text,
  total_files bigint,
  total_size bigint,
  avg_file_size bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as bucket_name,
    COUNT(o.id) as total_files,
    COALESCE(SUM(o.metadata->>'size')::bigint, 0) as total_size,
    CASE 
      WHEN COUNT(o.id) > 0 
      THEN COALESCE(SUM(o.metadata->>'size')::bigint, 0) / COUNT(o.id)
      ELSE 0 
    END as avg_file_size
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON b.id = o.bucket_id
  WHERE b.name = 'avatars'
  GROUP BY b.id, b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Commentaires pour la documentation
COMMENT ON TABLE storage.objects IS 'Stockage des fichiers utilisateur, incluant les avatars';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de l''avatar de l''utilisateur stocké dans Supabase Storage';
COMMENT ON FUNCTION get_avatar_url(uuid) IS 'Récupère l''URL de l''avatar d''un utilisateur';
COMMENT ON FUNCTION update_user_avatar(uuid, text) IS 'Met à jour l''avatar d''un utilisateur';
COMMENT ON FUNCTION cleanup_orphaned_avatars() IS 'Nettoie les avatars orphelins non référencés dans la table profiles';

-- 18. Vérification finale
DO $$
BEGIN
  -- Vérifier que le bucket existe
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    RAISE EXCEPTION 'Le bucket avatars n''a pas été créé correctement';
  END IF;
  
  -- Vérifier que les politiques existent
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload their own avatar') THEN
    RAISE EXCEPTION 'Les politiques de sécurité ne sont pas configurées correctement';
  END IF;
  
  RAISE NOTICE 'Configuration du stockage des avatars terminée avec succès!';
END $$;

