-- =====================================================
-- Migration: Fix question order on consultation_feedback v1
-- Story: UX correctif — questions conditionnelles adjacentes
-- Date: 2026-05-18
-- =====================================================
-- Bug UX : sur le template système `consultation_feedback`, la question
-- conditionnelle `what_remains_unclear` (qui dépend de Q2 understanding)
-- était seedée en position 4, après `time_fit` en position 3. Quand la
-- règle d'affichage se déclenche, elle apparaît APRÈS time_fit au lieu
-- de juste après Q2 — du coup le patient voit Q2 → Q3 (time_fit) → la
-- conditionnelle Q4 se "glisse" plus bas, ce qui casse le lien visuel
-- entre la conditionnelle et sa question parente.
--
-- Fix : on swap les positions 3 et 4. Nouvel ordre :
--   1. usefulness
--   2. understanding              ← parent
--   3. what_remains_unclear       ← conditionnel (apparaît juste après)
--   4. time_fit
--   5. priority_action
--   6. improvement
--
-- Le seed du template (add_questionnaire_templates.sql) est mis à jour
-- en parallèle pour que les installs from-scratch soient corrects ;
-- cette migration corrige uniquement les DB qui ont déjà appliqué la
-- version originale.
--
-- Idempotente : si l'ordre est déjà bon, on sort sans rien faire.
-- Le swap passe par des positions négatives temporaires pour éviter
-- une collision sur UNIQUE (template_version_id, position).
-- =====================================================

DO $$
DECLARE
    v_version_id UUID;
BEGIN
    SELECT v.id INTO v_version_id
    FROM questionnaire_template_versions v
    JOIN questionnaire_templates t ON t.id = v.template_id
    WHERE t.key = 'consultation_feedback'
      AND v.version = 1;

    IF v_version_id IS NULL THEN
        RAISE NOTICE 'consultation_feedback v1 not found, skipping';
        RETURN;
    END IF;

    -- Idempotence : si la conditionnelle est déjà en position 3, rien à faire.
    IF EXISTS (
        SELECT 1 FROM questionnaire_questions
        WHERE template_version_id = v_version_id
          AND key = 'what_remains_unclear'
          AND position = 3
    ) THEN
        RAISE NOTICE 'consultation_feedback already in correct order, skipping';
        RETURN;
    END IF;

    -- Étape 1 : déplacer les positions 3 et 4 vers des valeurs négatives
    -- temporaires pour libérer le namespace UNIQUE.
    UPDATE questionnaire_questions
    SET position = -position
    WHERE template_version_id = v_version_id
      AND position IN (3, 4);

    -- Étape 2 : assigner les positions finales par key (sûr — pas de
    -- dépendance à l'ordre des UPDATE).
    UPDATE questionnaire_questions
    SET position = 3
    WHERE template_version_id = v_version_id
      AND key = 'what_remains_unclear';

    UPDATE questionnaire_questions
    SET position = 4
    WHERE template_version_id = v_version_id
      AND key = 'time_fit';

    RAISE NOTICE 'consultation_feedback question order fixed (what_remains_unclear → 3, time_fit → 4)';
END $$;

-- =====================================================
-- Vérification post-déploiement :
--   SELECT key, position
--   FROM questionnaire_questions q
--   JOIN questionnaire_template_versions v ON v.id = q.template_version_id
--   JOIN questionnaire_templates t ON t.id = v.template_id
--   WHERE t.key = 'consultation_feedback' AND v.version = 1
--   ORDER BY position;
--
-- Attendu :
--   1 | usefulness
--   2 | understanding
--   3 | what_remains_unclear
--   4 | time_fit
--   5 | priority_action
--   6 | improvement
-- =====================================================
