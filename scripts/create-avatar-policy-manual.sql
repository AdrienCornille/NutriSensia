-- =====================================================
-- Script SQL pour créer manuellement les politiques RLS
-- pour le bucket avatars dans Supabase
-- =====================================================

-- IMPORTANT: Exécutez ce script dans l'éditeur SQL de Supabase
-- Interface: Supabase Dashboard → SQL Editor

-- 1. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 2. Créer une politique permissive pour le développement
-- ATTENTION: Cette politique permet TOUS les accès au bucket avatars
-- Utilisez uniquement pour le développement!
CREATE POLICY "Allow all operations on avatars bucket" ON storage.objects
FOR ALL USING (bucket_id = 'avatars');

-- 3. Alternative: Politiques plus restrictives pour la production
-- (Décommentez ces lignes et commentez la politique ci-dessus pour la production)

/*
-- Politique SELECT (lecture publique)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Politique INSERT (upload authentifié)
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Politique UPDATE (mise à jour par propriétaire)
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Politique DELETE (suppression par propriétaire)
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);
*/

-- 4. Vérifier que les politiques ont été créées
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

-- 5. Vérifier l'état de RLS sur la table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
