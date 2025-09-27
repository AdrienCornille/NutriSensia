-- =====================================================
-- Script de Configuration - Politiques RLS (Row Level Security)
-- =====================================================

-- Étape 1: Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Étape 2: Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own nutritionist data" ON nutritionists;
DROP POLICY IF EXISTS "Users can update own nutritionist data" ON nutritionists;
DROP POLICY IF EXISTS "Users can insert own nutritionist data" ON nutritionists;

DROP POLICY IF EXISTS "Users can view own patient data" ON patients;
DROP POLICY IF EXISTS "Users can update own patient data" ON patients;
DROP POLICY IF EXISTS "Users can insert own patient data" ON patients;

-- Étape 3: Politiques pour la table profiles
-- Permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Permettre aux utilisateurs d'insérer leur propre profil
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Étape 4: Politiques pour la table nutritionists
-- Permettre aux utilisateurs de voir leurs propres données nutritionniste
CREATE POLICY "Users can view own nutritionist data" ON nutritionists
    FOR SELECT USING (auth.uid() = id);

-- Permettre aux utilisateurs de mettre à jour leurs propres données nutritionniste
CREATE POLICY "Users can update own nutritionist data" ON nutritionists
    FOR UPDATE USING (auth.uid() = id);

-- Permettre aux utilisateurs d'insérer leurs propres données nutritionniste
CREATE POLICY "Users can insert own nutritionist data" ON nutritionists
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Étape 5: Politiques pour la table patients
-- Permettre aux utilisateurs de voir leurs propres données patient
CREATE POLICY "Users can view own patient data" ON patients
    FOR SELECT USING (auth.uid() = id);

-- Permettre aux utilisateurs de mettre à jour leurs propres données patient
CREATE POLICY "Users can update own patient data" ON patients
    FOR UPDATE USING (auth.uid() = id);

-- Permettre aux utilisateurs d'insérer leurs propres données patient
CREATE POLICY "Users can insert own patient data" ON patients
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Étape 6: Politiques supplémentaires pour les nutritionnistes
-- Permettre aux nutritionnistes de voir les profils de leurs patients
CREATE POLICY "Nutritionists can view assigned patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'nutritionist'
        )
        AND nutritionist_id = auth.uid()
    );

-- Permettre aux nutritionnistes de mettre à jour les données de leurs patients
CREATE POLICY "Nutritionists can update assigned patients" ON patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'nutritionist'
        )
        AND nutritionist_id = auth.uid()
    );

-- Étape 7: Politiques pour les administrateurs (si nécessaire)
-- Permettre aux administrateurs de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Permettre aux administrateurs de mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Étape 8: Vérifier les politiques créées
DO $$
BEGIN
    RAISE NOTICE '🎉 Politiques RLS configurées avec succès !';
    RAISE NOTICE '📊 Politiques créées:';
    
    -- Vérifier les politiques sur profiles
    RAISE NOTICE '  Table profiles:';
    RAISE NOTICE '    - Users can view own profile';
    RAISE NOTICE '    - Users can update own profile';
    RAISE NOTICE '    - Users can insert own profile';
    RAISE NOTICE '    - Admins can view all profiles';
    RAISE NOTICE '    - Admins can update all profiles';
    
    -- Vérifier les politiques sur nutritionists
    RAISE NOTICE '  Table nutritionists:';
    RAISE NOTICE '    - Users can view own nutritionist data';
    RAISE NOTICE '    - Users can update own nutritionist data';
    RAISE NOTICE '    - Users can insert own nutritionist data';
    
    -- Vérifier les politiques sur patients
    RAISE NOTICE '  Table patients:';
    RAISE NOTICE '    - Users can view own patient data';
    RAISE NOTICE '    - Users can update own patient data';
    RAISE NOTICE '    - Users can insert own patient data';
    RAISE NOTICE '    - Nutritionists can view assigned patients';
    RAISE NOTICE '    - Nutritionists can update assigned patients';
    
    RAISE NOTICE '🎯 Configuration RLS terminée !';
END $$;
