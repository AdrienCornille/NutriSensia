-- =====================================================
-- Migration: Fix RLS infinite recursion on questionnaire_templates
-- Story: QUEST-ASSIGN-004
-- Date: 2026-05-17
-- =====================================================
-- Bug : la migration précédente fix_questionnaire_patient_read_access.sql
-- a introduit une récursion :
--
--   qt_read (branche patient) interroge questionnaire_template_versions
--     → déclenche qtv_read
--     → qtv_read interroge questionnaire_templates
--     → re-déclenche qt_read
--     → boucle infinie
--
-- Erreur Postgres : "infinite recursion detected in policy for relation
-- questionnaire_templates".
--
-- Fix : on remplace les sous-requêtes EXISTS croisées par des appels à
-- des fonctions SECURITY DEFINER. Ces fonctions exécutent leur lookup
-- avec les privilèges du propriétaire (= bypass RLS) ce qui casse le
-- cycle. auth.uid() reste correctement scopé au session caller.
-- =====================================================

-- =====================================================
-- 1. FONCTIONS SECURITY DEFINER
-- =====================================================
-- Chacune répond à la question : « le patient courant (auth.uid()) a-t-il
-- un assignment sur ce template / cette version / cette question ? »
-- =====================================================

CREATE OR REPLACE FUNCTION patient_can_read_questionnaire_template(
    p_template_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM questionnaire_template_versions v
        JOIN questionnaire_assignments a
            ON a.template_version_id = v.id
        WHERE v.template_id = p_template_id
          AND a.patient_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION patient_can_read_questionnaire_version(
    p_version_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM questionnaire_assignments a
        WHERE a.template_version_id = p_version_id
          AND a.patient_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION patient_can_read_questionnaire_question(
    p_question_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM questionnaire_questions q
        JOIN questionnaire_assignments a
            ON a.template_version_id = q.template_version_id
        WHERE q.id = p_question_id
          AND a.patient_id = auth.uid()
    );
$$;

-- Supabase exige un GRANT EXECUTE explicite pour que le rôle `authenticated`
-- puisse appeler les fonctions depuis les policies.
GRANT EXECUTE ON FUNCTION patient_can_read_questionnaire_template(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION patient_can_read_questionnaire_version(uuid)  TO authenticated;
GRANT EXECUTE ON FUNCTION patient_can_read_questionnaire_question(uuid) TO authenticated;

-- =====================================================
-- 2. RÉCRITURE DES POLICIES — remplace les EXISTS récursifs
-- =====================================================

-- ----- questionnaire_templates ---------------------------------------
DROP POLICY IF EXISTS qt_read ON questionnaire_templates;
CREATE POLICY qt_read ON questionnaire_templates
    FOR SELECT TO authenticated
    USING (
        is_system = true
        OR created_by = auth.uid()
        OR patient_can_read_questionnaire_template(id)
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
        OR patient_can_read_questionnaire_version(id)
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
        OR patient_can_read_questionnaire_question(id)
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
        OR patient_can_read_questionnaire_question(question_id)
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
        OR patient_can_read_questionnaire_question(question_id)
    );

-- =====================================================
-- Vérification post-déploiement
-- =====================================================
-- En tant que patient :
--   SELECT t.id, t.title FROM questionnaire_templates t
--   JOIN questionnaire_template_versions v ON v.template_id = t.id
--   JOIN questionnaire_assignments a ON a.template_version_id = v.id
--   WHERE a.patient_id = auth.uid();
-- Doit retourner les templates des assignments, sans erreur de récursion.
-- =====================================================
