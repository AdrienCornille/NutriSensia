-- ============================================================================
-- Script: Données de test pour le module Activité physique (2.5 - BIO-007)
-- Description: Insère 14 jours d'activités pour tester le module
-- Usage: Exécuter dans Supabase SQL Editor
-- ============================================================================

-- IMPORTANT: Remplacer l'email par le vôtre si différent

DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'adrien.cornille88@gmail.com'; -- <-- REMPLACER PAR VOTRE EMAIL
    v_running_id UUID;
    v_cycling_id UUID;
    v_gym_id UUID;
    v_swimming_id UUID;
    v_yoga_id UUID;
    v_walking_id UUID;
BEGIN
    -- Récupérer l'ID utilisateur
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé avec email: %', v_email;
    END IF;

    RAISE NOTICE 'Utilisateur trouvé: %', v_user_id;

    -- Récupérer les IDs des types d'activités
    SELECT id INTO v_running_id FROM activity_types WHERE slug = 'running';
    SELECT id INTO v_cycling_id FROM activity_types WHERE slug = 'cycling';
    SELECT id INTO v_gym_id FROM activity_types WHERE slug = 'gym';
    SELECT id INTO v_swimming_id FROM activity_types WHERE slug = 'swimming';
    SELECT id INTO v_yoga_id FROM activity_types WHERE slug = 'yoga';
    SELECT id INTO v_walking_id FROM activity_types WHERE slug = 'walking';

    IF v_running_id IS NULL OR v_cycling_id IS NULL OR v_gym_id IS NULL OR
       v_swimming_id IS NULL OR v_yoga_id IS NULL OR v_walking_id IS NULL THEN
        RAISE EXCEPTION 'Types d''activités non trouvés. Assurez-vous que la table activity_types est bien peuplée.';
    END IF;

    RAISE NOTICE 'Types d''activités trouvés';

    -- Supprimer les anciennes données de test (optionnel)
    DELETE FROM activities
    WHERE user_id = v_user_id
    AND date >= CURRENT_DATE - INTERVAL '30 days';

    RAISE NOTICE 'Anciennes données supprimées';

    -- Insérer 14 jours d'activités variées
    -- Note: Les valeurs intensity valides sont: 'light', 'moderate', 'vigorous', 'very_vigorous'

    -- === SEMAINE 1 (Il y a 14-8 jours) - Semaine active ===
    INSERT INTO activities (user_id, date, activity_type_id, duration_minutes, intensity, notes, source)
    VALUES
    -- Lundi - Course
    (v_user_id, CURRENT_DATE - INTERVAL '14 days', v_running_id, 30, 'moderate', 'Course matinale au parc', 'manual'),
    -- Mercredi - Musculation
    (v_user_id, CURRENT_DATE - INTERVAL '12 days', v_gym_id, 45, 'vigorous', 'Séance full body', 'manual'),
    -- Vendredi - Natation
    (v_user_id, CURRENT_DATE - INTERVAL '10 days', v_swimming_id, 40, 'moderate', 'Piscine municipale', 'manual'),
    -- Dimanche - Yoga
    (v_user_id, CURRENT_DATE - INTERVAL '8 days', v_yoga_id, 60, 'light', 'Yoga matinal', 'manual');

    RAISE NOTICE 'Semaine 1 insérée (4 activités)';

    -- === SEMAINE 2 (7 derniers jours) - Semaine variée ===
    INSERT INTO activities (user_id, date, activity_type_id, duration_minutes, intensity, notes, source)
    VALUES
    -- Lundi - Course
    (v_user_id, CURRENT_DATE - INTERVAL '7 days', v_running_id, 25, 'light', 'Reprise en douceur', 'manual'),
    -- Mardi - Vélo
    (v_user_id, CURRENT_DATE - INTERVAL '6 days', v_cycling_id, 45, 'moderate', 'Trajet travail', 'manual'),
    -- Mercredi - Musculation
    (v_user_id, CURRENT_DATE - INTERVAL '5 days', v_gym_id, 50, 'vigorous', 'Séance jambes', 'manual'),
    -- Jeudi - Marche
    (v_user_id, CURRENT_DATE - INTERVAL '4 days', v_walking_id, 30, 'light', 'Promenade digestive', 'manual'),
    -- Vendredi - Course
    (v_user_id, CURRENT_DATE - INTERVAL '3 days', v_running_id, 35, 'moderate', 'Interval training', 'manual'),
    -- Samedi - Yoga
    (v_user_id, CURRENT_DATE - INTERVAL '2 days', v_yoga_id, 45, 'light', 'Yoga détente', 'manual'),
    -- Dimanche - Natation
    (v_user_id, CURRENT_DATE - INTERVAL '1 day', v_swimming_id, 50, 'very_vigorous', 'Natation intensive', 'manual');

    RAISE NOTICE 'Semaine 2 insérée (7 activités)';

    -- Vérification
    RAISE NOTICE '=== RÉSUMÉ ===';
    RAISE NOTICE 'Total activités: %', (SELECT COUNT(*) FROM activities WHERE user_id = v_user_id);

END $$;

-- ============================================================================
-- Vérification des données insérées
-- ============================================================================

SELECT
    a.date,
    at.slug as activity_type,
    at.name_fr as activity_name,
    a.duration_minutes,
    a.intensity,
    a.calories_burned,
    a.notes
FROM activities a
JOIN activity_types at ON a.activity_type_id = at.id
WHERE a.user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
ORDER BY a.date DESC;

-- ============================================================================
-- Statistiques pour la semaine en cours
-- ============================================================================

SELECT
    'Total sessions cette semaine' as metric,
    COUNT(*)::text as value
FROM activities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
AND date >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT
    'Total minutes cette semaine',
    COALESCE(SUM(duration_minutes), 0)::text
FROM activities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
AND date >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT
    'Total calories brûlées cette semaine',
    COALESCE(SUM(calories_burned), 0)::text
FROM activities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
AND date >= CURRENT_DATE - INTERVAL '7 days';

-- ============================================================================
-- Résultat attendu:
-- ============================================================================
-- - 11 activités sur 14 jours
-- - Semaine en cours: 7 sessions, ~280 minutes
-- - Calories calculées automatiquement par le trigger
-- - Types variés: running, gym, swimming, yoga, cycling, walking
-- ============================================================================
