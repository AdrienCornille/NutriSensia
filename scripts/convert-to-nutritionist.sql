-- ============================================================================
-- Script de conversion d'un utilisateur existant en nutritionniste
-- Utilisateur: siniam34@gmail.com
-- ============================================================================

-- 1. Vérifier l'état actuel de l'utilisateur
SELECT
    '=== ÉTAT ACTUEL ===' as section,
    u.id as user_id,
    u.email,
    p.role as current_role,
    p.first_name,
    p.last_name,
    p.account_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'siniam34@gmail.com';

-- 2. Mettre à jour le rôle dans profiles
UPDATE profiles
SET
    role = 'nutritionist',
    updated_at = NOW()
WHERE email = 'siniam34@gmail.com';

-- 3. Mettre à jour les métadonnées auth (raw_user_meta_data)
UPDATE auth.users
SET
    raw_user_meta_data = raw_user_meta_data || '{"role": "nutritionist"}'::jsonb,
    updated_at = NOW()
WHERE email = 'siniam34@gmail.com';

-- 4. Créer le profil nutritionniste s'il n'existe pas
INSERT INTO nutritionist_profiles (
    id,
    user_id,
    first_name,
    last_name,
    email,
    phone,
    specializations,
    bio,
    years_experience,
    languages,
    is_active,
    verified_at,
    status,
    asca_number,
    rme_number,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    u.id,
    COALESCE(p.first_name, 'Test'),
    COALESCE(p.last_name, 'Nutritionniste'),
    u.email,
    COALESCE(p.phone, '+41 79 000 00 00'),
    ARRAY['Nutrition générale', 'Perte de poids', 'Bien-être'],
    'Nutritionniste de test pour le développement.',
    5,
    ARRAY['fr', 'en'],
    true,
    NOW(),
    'active',
    'ASCA-TEST-001',
    'RME-TEST-001',
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'siniam34@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM nutritionist_profiles np WHERE np.user_id = u.id
);

-- 5. Vérifier le résultat
SELECT
    '=== RÉSULTAT ===' as section,
    u.id as user_id,
    u.email,
    p.role as new_role,
    np.id as nutritionist_profile_id,
    np.is_active,
    np.status,
    np.specializations
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN nutritionist_profiles np ON np.user_id = u.id
WHERE u.email = 'siniam34@gmail.com';

-- 6. Afficher l'ID du nutritionniste pour la configuration
SELECT
    '=== CONFIGURATION ===' as info,
    np.id as nutritionist_profile_id,
    'Ajoutez dans .env.local: DEFAULT_NUTRITIONIST_ID=' || np.id::text as env_variable
FROM nutritionist_profiles np
JOIN profiles p ON p.id = np.user_id
WHERE p.email = 'siniam34@gmail.com';
