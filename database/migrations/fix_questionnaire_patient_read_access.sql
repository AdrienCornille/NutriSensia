-- =====================================================
-- Migration: Fix RLS — patients must be able to read the templates
-- (versions, questions, options, display rules) that they have been
-- assigned to.
-- Story: QUEST-ASSIGN-003
-- Date: 2026-05-17
-- =====================================================
-- Bug : les policies SELECT créées en P1 limitaient l'accès aux
-- templates « système » ou « créés par l'utilisateur ». Or les
-- questionnaires créés en P2.B sont stockés comme des templates
-- personnels du NUTRITIONNISTE (is_draft=true, created_by=nutri).
-- Du coup, le patient à qui le questionnaire est assigné ne pouvait
-- pas lire les questions/options via les joins imbriqués → l'inbox
-- patient remontait vide alors que les assignments existaient.
--
-- Fix : ajout d'une branche OR dans chaque policy SELECT — le patient
-- a accès à la structure du template uniquement s'il existe un
-- assignment qui lui est destiné.
--
-- Note : `questionnaire_template_scoring_rules` n'est PAS étendu :
-- le score (SCOFF) ne doit jamais être lisible par le patient.
-- =====================================================

-- ----- questionnaire_templates ---------------------------------------
DROP POLICY IF EXISTS qt_read ON questionnaire_templates;
CREATE POLICY qt_read ON questionnaire_templates
    FOR SELECT TO authenticated
    USING (
        is_system = true
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM questionnaire_template_versions v
            JOIN questionnaire_assignments a
                ON a.template_version_id = v.id
            WHERE v.template_id = questionnaire_templates.id
              AND a.patient_id = auth.uid()
        )
    );

-- ----- questionnaire_template_versions -------------------------------
DROP POLICY IF EXISTS qtv_read ON questionnaire_template_versions;
CREATE POLICY qtv_read ON questionnaire_template_versions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_templates t
            WHERE t.id = template_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM questionnaire_assignments a
            WHERE a.template_version_id = questionnaire_template_versions.id
              AND a.patient_id = auth.uid()
        )
    );

-- ----- questionnaire_questions ---------------------------------------
DROP POLICY IF EXISTS qq_read ON questionnaire_questions;
CREATE POLICY qq_read ON questionnaire_questions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM questionnaire_template_versions v
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE v.id = template_version_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM questionnaire_assignments a
            WHERE a.template_version_id = questionnaire_questions.template_version_id
              AND a.patient_id = auth.uid()
        )
    );

-- ----- questionnaire_question_options --------------------------------
DROP POLICY IF EXISTS qqo_read ON questionnaire_question_options;
CREATE POLICY qqo_read ON questionnaire_question_options
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1
            FROM questionnaire_questions q
            JOIN questionnaire_assignments a
                ON a.template_version_id = q.template_version_id
            WHERE q.id = question_id
              AND a.patient_id = auth.uid()
        )
    );

-- ----- questionnaire_question_display_rules --------------------------
DROP POLICY IF EXISTS qqdr_read ON questionnaire_question_display_rules;
CREATE POLICY qqdr_read ON questionnaire_question_display_rules
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1
            FROM questionnaire_questions q
            JOIN questionnaire_assignments a
                ON a.template_version_id = q.template_version_id
            WHERE q.id = question_id
              AND a.patient_id = auth.uid()
        )
    );

-- =====================================================
-- Vérification post-déploiement
-- =====================================================
-- En tant que patient (auth.uid() = patient_id d'au moins un assignment),
-- la requête suivante doit retourner les templates de ses assignments :
--
--   SELECT t.id, t.title, t.is_system, t.is_draft
--   FROM questionnaire_templates t
--   JOIN questionnaire_template_versions v ON v.template_id = t.id
--   JOIN questionnaire_assignments a ON a.template_version_id = v.id
--   WHERE a.patient_id = auth.uid();
-- =====================================================
