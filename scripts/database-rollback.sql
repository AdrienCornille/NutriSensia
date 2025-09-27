-- =====================================================
-- SCRIPT DE ROLLBACK POUR LA MIGRATION DE BASE DE DONNÉES
-- À utiliser seulement si la migration échoue ou cause des problèmes
-- =====================================================

-- ⚠️  ATTENTION: Ce script restaure l'ancienne structure
-- Utilisez seulement si nécessaire !

-- =====================================================
-- 1. RESTAURER LA TABLE NUTRITIONISTS
-- =====================================================

-- Recréer la table nutritionists depuis la sauvegarde
CREATE TABLE IF NOT EXISTS nutritionists AS SELECT * FROM nutritionists_backup;

-- Restaurer les contraintes et index
ALTER TABLE nutritionists ADD PRIMARY KEY (id);
ALTER TABLE nutritionists ADD CONSTRAINT nutritionists_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- 2. RESTAURER LES COLONNES DANS PROFILES
-- =====================================================

-- Ajouter les colonnes supprimées
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Restaurer les données depuis la sauvegarde
UPDATE profiles SET
    first_name = pb.first_name,
    last_name = pb.last_name,
    full_name = pb.full_name,
    phone = pb.phone,
    avatar_url = pb.avatar_url,
    locale = pb.locale,
    timezone = pb.timezone
FROM profiles_backup pb
WHERE profiles.id = pb.id;

-- =====================================================
-- 3. SUPPRIMER LES NOUVELLES TABLES
-- =====================================================

-- Supprimer les nouvelles tables créées
DROP TABLE IF EXISTS nutritionist_profiles CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;

-- =====================================================
-- 4. NETTOYER LES SAUVEGARDES (optionnel)
-- =====================================================

-- Décommenter ces lignes pour supprimer les sauvegardes après rollback
-- DROP TABLE IF EXISTS profiles_backup;
-- DROP TABLE IF EXISTS nutritionists_backup;

-- =====================================================
-- ROLLBACK TERMINÉ
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔄 Rollback terminé !';
    RAISE NOTICE '📊 Structure restaurée :';
    RAISE NOTICE '   - Table nutritionists restaurée';
    RAISE NOTICE '   - Table profiles avec toutes les colonnes';
    RAISE NOTICE '   - Nouvelles tables supprimées';
    RAISE NOTICE '⚠️  Pensez à redémarrer l''application après le rollback';
END $$;

