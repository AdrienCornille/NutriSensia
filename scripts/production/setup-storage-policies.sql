-- Script de configuration des politiques de sécurité pour le stockage Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- =====================================================
-- POLITIQUES POUR LE BUCKET AVATARS
-- =====================================================

-- 1. Politique pour permettre l'upload d'avatars (authentifiés uniquement)
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Politique pour permettre la mise à jour d'avatars (propriétaire uniquement)
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique pour permettre la suppression d'avatars (propriétaire uniquement)
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Politique pour permettre la lecture d'avatars (public, car les avatars sont publics)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
);

-- =====================================================
-- POLITIQUES POUR LE BUCKET DOCUMENTS (PRIVÉ)
-- =====================================================

-- 1. Politique pour permettre l'upload de documents (authentifiés uniquement)
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Politique pour permettre la lecture de documents (propriétaire uniquement)
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique pour permettre la mise à jour de documents (propriétaire uniquement)
CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Politique pour permettre la suppression de documents (propriétaire uniquement)
CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- POLITIQUES POUR LE BUCKET TEMP (TEMPORAIRE)
-- =====================================================

-- 1. Politique pour permettre l'upload de fichiers temporaires (authentifiés uniquement)
CREATE POLICY "Users can upload temporary files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'temp' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Politique pour permettre la lecture de fichiers temporaires (propriétaire uniquement)
CREATE POLICY "Users can view their temporary files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'temp' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique pour permettre la suppression de fichiers temporaires (propriétaire uniquement)
CREATE POLICY "Users can delete their temporary files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'temp' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- FONCTION POUR NETTOYER LES FICHIERS TEMPORAIRES
-- =====================================================

-- Fonction pour supprimer automatiquement les fichiers temporaires anciens (plus de 24h)
CREATE OR REPLACE FUNCTION cleanup_temp_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'temp' 
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Créer un job pour exécuter le nettoyage automatiquement (optionnel)
-- SELECT cron.schedule('cleanup-temp-files', '0 2 * * *', 'SELECT cleanup_temp_files();');

-- =====================================================
-- VÉRIFICATION DES POLITIQUES
-- =====================================================

-- Requête pour vérifier que toutes les politiques sont en place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
