-- Script Ultra-Simple pour Désactiver RLS
-- Exécutez ceci dans votre SQL Editor Supabase

-- 1. Désactiver RLS
ALTER TABLE nutritionists DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques
DROP POLICY IF EXISTS "nutritionists_select_policy" ON nutritionists;
DROP POLICY IF EXISTS "nutritionists_update_policy" ON nutritionists;
DROP POLICY IF EXISTS "nutritionists_insert_policy" ON nutritionists;
DROP POLICY IF EXISTS "nutritionists_read_policy" ON nutritionists;
DROP POLICY IF EXISTS "Users can view own nutritionist data" ON nutritionists;
DROP POLICY IF EXISTS "Users can update own nutritionist data" ON nutritionists;
DROP POLICY IF EXISTS "Users can insert own nutritionist data" ON nutritionists;

-- 3. Vérifier que c'est fait
SELECT 
    tablename, 
    rowsecurity as "RLS activé",
    CASE WHEN rowsecurity THEN '❌ RLS ACTIF' ELSE '✅ RLS DÉSACTIVÉ' END as "Statut"
FROM pg_tables 
WHERE tablename = 'nutritionists';

-- 4. Vérifier qu'il n'y a plus de politiques
SELECT COUNT(*) as "Nombre de politiques restantes"
FROM pg_policies 
WHERE tablename = 'nutritionists';
