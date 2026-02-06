-- ============================================================================
-- Script d'inspection du schéma pour le module Appointments
-- Exécutez ce script dans Supabase SQL Editor et partagez les résultats
-- ============================================================================

-- 1. Structure de la table appointments
SELECT '=== TABLE: appointments ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'appointments'
ORDER BY ordinal_position;

-- 2. Contraintes et clés étrangères de appointments
SELECT '=== FOREIGN KEYS: appointments ===' as info;
SELECT
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
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'appointments'
  AND tc.table_schema = 'public';

-- 3. Politiques RLS sur appointments
SELECT '=== RLS POLICIES: appointments ===' as info;
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'appointments';

-- 4. Structure de patient_profiles
SELECT '=== TABLE: patient_profiles ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patient_profiles'
ORDER BY ordinal_position;

-- 5. Structure de nutritionist_profiles
SELECT '=== TABLE: nutritionist_profiles ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'nutritionist_profiles'
ORDER BY ordinal_position;

-- 6. Structure de consultation_types
SELECT '=== TABLE: consultation_types ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'consultation_types'
ORDER BY ordinal_position;

-- 7. Données dans consultation_types
SELECT '=== DATA: consultation_types ===' as info;
SELECT id, code, name_fr, default_duration, default_price, is_active
FROM consultation_types
ORDER BY sort_order;

-- 8. Vérifier les enums utilisés
SELECT '=== ENUM: appointment_status ===' as info;
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_status');

SELECT '=== ENUM: consultation_mode ===' as info;
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'consultation_mode');

-- 9. Exemple de patient_profile pour l'utilisateur de test
SELECT '=== SAMPLE: patient_profiles (your user) ===' as info;
SELECT id, user_id, nutritionist_id, status
FROM patient_profiles
WHERE user_id = auth.uid();

-- 10. Vérifier s'il y a des nutritionnistes
SELECT '=== SAMPLE: nutritionist_profiles ===' as info;
SELECT id, user_id, title, cabinet_name
FROM nutritionist_profiles
LIMIT 5;
