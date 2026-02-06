-- ============================================================================
-- Script: Données de test pour le module Bien-être (2.4)
-- Description: Insère 21 jours de données pour tester les insights
-- Usage: Exécuter dans Supabase SQL Editor
-- ============================================================================

-- IMPORTANT: Remplacer <VOTRE_EMAIL> par votre email de connexion
-- Exemple: 'adrien.cornille88@gmail.com'

DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'adrien.cornille88@gmail.com'; -- <-- REMPLACER PAR VOTRE EMAIL
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

    -- Supprimer les anciennes données de test (optionnel)
    DELETE FROM wellbeing_logs
    WHERE user_id = v_user_id
    AND date >= CURRENT_DATE - INTERVAL '30 days';

    RAISE NOTICE 'Anciennes données supprimées';

    -- Insérer 21 jours de données variées
    -- Pattern: Bonnes semaines avec bon sommeil, semaine difficile au milieu

    -- === SEMAINE 1 (Il y a 21-15 jours) - Bonne semaine ===
    INSERT INTO wellbeing_logs (user_id, date, energy_level, sleep_hours, sleep_quality, mood, digestion, symptoms, notes)
    VALUES
    (v_user_id, CURRENT_DATE - INTERVAL '21 days', 8, 7.5, 8, 'good', 'excellent', ARRAY[]::text[], 'Bonne journée'),
    (v_user_id, CURRENT_DATE - INTERVAL '20 days', 9, 8.0, 9, 'very_good', 'excellent', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '19 days', 7, 7.0, 7, 'good', 'good', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '18 days', 8, 7.5, 8, 'good', 'excellent', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '17 days', 6, 6.5, 6, 'neutral', 'average', ARRAY['bloating']::text[], 'Repas lourd hier soir'),
    (v_user_id, CURRENT_DATE - INTERVAL '16 days', 8, 8.0, 8, 'very_good', 'excellent', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '15 days', 7, 7.0, 7, 'good', 'good', ARRAY[]::text[], NULL);

    RAISE NOTICE 'Semaine 1 insérée';

    -- === SEMAINE 2 (Il y a 14-8 jours) - Semaine difficile (moins de sommeil, humeur basse) ===
    -- Note: Les valeurs mood valides sont: 'very_good', 'good', 'neutral', 'bad', 'very_bad'
    INSERT INTO wellbeing_logs (user_id, date, energy_level, sleep_hours, sleep_quality, mood, digestion, symptoms, notes)
    VALUES
    (v_user_id, CURRENT_DATE - INTERVAL '14 days', 5, 5.5, 5, 'neutral', 'average', ARRAY['bloating']::text[], 'Stress au travail'),
    (v_user_id, CURRENT_DATE - INTERVAL '13 days', 4, 5.0, 4, 'bad', 'poor', ARRAY['constipation']::text[], 'Mal dormi'),
    (v_user_id, CURRENT_DATE - INTERVAL '12 days', 5, 6.0, 5, 'bad', 'average', ARRAY['bloating']::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '11 days', 4, 5.5, 4, 'very_bad', 'poor', ARRAY['cramps']::text[], 'Fatigue persistante'),
    (v_user_id, CURRENT_DATE - INTERVAL '10 days', 5, 6.0, 5, 'neutral', 'average', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '9 days', 6, 6.5, 6, 'neutral', 'good', ARRAY[]::text[], 'Un peu mieux'),
    (v_user_id, CURRENT_DATE - INTERVAL '8 days', 5, 5.5, 5, 'bad', 'average', ARRAY['bloating']::text[], NULL);

    RAISE NOTICE 'Semaine 2 insérée';

    -- === SEMAINE 3 (7 derniers jours) - Amélioration progressive ===
    INSERT INTO wellbeing_logs (user_id, date, energy_level, sleep_hours, sleep_quality, mood, digestion, symptoms, notes)
    VALUES
    (v_user_id, CURRENT_DATE - INTERVAL '7 days', 6, 7.0, 6, 'neutral', 'good', ARRAY[]::text[], 'Reprise du sport'),
    (v_user_id, CURRENT_DATE - INTERVAL '6 days', 7, 7.5, 7, 'good', 'excellent', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '5 days', 7, 7.0, 7, 'good', 'good', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '4 days', 8, 8.0, 8, 'good', 'excellent', ARRAY[]::text[], 'Bonne nuit'),
    (v_user_id, CURRENT_DATE - INTERVAL '3 days', 8, 7.5, 8, 'very_good', 'excellent', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '2 days', 7, 7.0, 7, 'good', 'good', ARRAY[]::text[], NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '1 day', 8, 8.0, 8, 'very_good', 'excellent', ARRAY[]::text[], 'Energie retrouvée!');

    RAISE NOTICE 'Semaine 3 insérée';

    -- Vérification
    RAISE NOTICE '=== RÉSUMÉ ===';
    RAISE NOTICE 'Total entrées: %', (SELECT COUNT(*) FROM wellbeing_logs WHERE user_id = v_user_id);

END $$;

-- ============================================================================
-- Vérification des données insérées
-- ============================================================================

SELECT
    date,
    energy_level,
    sleep_hours,
    mood,
    digestion,
    symptoms,
    notes
FROM wellbeing_logs
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
ORDER BY date DESC;

-- ============================================================================
-- Statistiques pour les insights attendus
-- ============================================================================

SELECT
    'Total jours' as metric,
    COUNT(*)::text as value
FROM wellbeing_logs
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
UNION ALL
SELECT
    'Moyenne sommeil',
    ROUND(AVG(sleep_hours)::numeric, 1)::text
FROM wellbeing_logs
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
UNION ALL
SELECT
    'Jours avec troubles digestifs',
    COUNT(*)::text
FROM wellbeing_logs
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'adrien.cornille88@gmail.com' LIMIT 1)
AND array_length(symptoms, 1) > 0;

-- ============================================================================
-- Insights attendus avec ces données:
-- ============================================================================
-- 1. Corrélation sommeil/énergie: OUI (différence significative)
-- 2. Troubles digestifs: OUI (~28% des jours ont des symptômes)
-- 3. Tendance humeur: AMÉLIORATION (semaine récente meilleure que précédente)
-- 4. Déficit sommeil: NON (moyenne ~6.8h, proche de 7h)
-- ============================================================================
