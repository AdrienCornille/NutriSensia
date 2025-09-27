-- =====================================================
-- Configuration du stockage d'avatars
-- Création des politiques RLS pour le bucket 'avatars'
-- =====================================================

-- Fonction pour créer la politique SELECT (lecture publique)
CREATE OR REPLACE FUNCTION create_avatar_select_policy()
RETURNS void AS $$
BEGIN
  -- Permettre la lecture publique des avatars
  CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION
  WHEN duplicate_object THEN
    -- La politique existe déjà, on continue
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer la politique INSERT (upload authentifié)
CREATE OR REPLACE FUNCTION create_avatar_insert_policy()
RETURNS void AS $$
BEGIN
  -- Permettre l'upload aux utilisateurs authentifiés
  CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'avatars'
  );
EXCEPTION
  WHEN duplicate_object THEN
    -- La politique existe déjà, on continue
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer la politique UPDATE (mise à jour par propriétaire)
CREATE OR REPLACE FUNCTION create_avatar_update_policy()
RETURNS void AS $$
BEGIN
  -- Permettre la mise à jour aux propriétaires
  CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
EXCEPTION
  WHEN duplicate_object THEN
    -- La politique existe déjà, on continue
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer la politique DELETE (suppression par propriétaire)
CREATE OR REPLACE FUNCTION create_avatar_delete_policy()
RETURNS void AS $$
BEGIN
  -- Permettre la suppression aux propriétaires
  CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
EXCEPTION
  WHEN duplicate_object THEN
    -- La politique existe déjà, on continue
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Exécuter les fonctions pour créer les politiques
SELECT create_avatar_select_policy();
SELECT create_avatar_insert_policy();
SELECT create_avatar_update_policy();
SELECT create_avatar_delete_policy();

-- Nettoyer les fonctions temporaires
DROP FUNCTION IF EXISTS create_avatar_select_policy();
DROP FUNCTION IF EXISTS create_avatar_insert_policy();
DROP FUNCTION IF EXISTS create_avatar_update_policy();
DROP FUNCTION IF EXISTS create_avatar_delete_policy();

-- Vérifier que les politiques ont été créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%avatar%'
ORDER BY policyname;