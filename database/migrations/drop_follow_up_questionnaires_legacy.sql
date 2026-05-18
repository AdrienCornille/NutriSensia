-- =====================================================
-- Migration: Retire follow_up_questionnaires du schéma actif
-- Story: P2.C.3 — fin de l'epic questionnaires patient
-- Date: 2026-05-18
-- =====================================================
-- Contexte : depuis P2.B, plus aucun endpoint API ne lit ou n'écrit
-- `follow_up_questionnaires`. Le backfill a été exécuté en P2.A et la
-- nouvelle pipeline (assignments + responses) est en prod.
--
-- Ce qu'on fait :
--   1. Renomme la table en `follow_up_questionnaires_legacy` (pas un DROP
--      pour garder un filet de sécurité — on peut restaurer en cas de
--      régression non détectée). Le DROP final sera fait dans une
--      migration ultérieure après une période d'observation.
--   2. Met à jour `get_patient_file_summary()` pour compter via les
--      nouvelles tables (`questionnaire_responses`). Sans ça la fonction
--      casse au prochain appel (le dossier patient ne s'afficherait plus).
--   3. Drop la colonne `questionnaire_assignments.legacy_source_id` —
--      sa raison d'être (trace du backfill) n'a plus d'utilité une fois
--      la table source retirée.
--
-- Idempotente : chaque étape vérifie son état avant d'agir.
-- =====================================================

-- =====================================================
-- 1. Renommer follow_up_questionnaires → follow_up_questionnaires_legacy
-- =====================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'follow_up_questionnaires'
    ) THEN
        ALTER TABLE follow_up_questionnaires
            RENAME TO follow_up_questionnaires_legacy;
        RAISE NOTICE 'Renamed follow_up_questionnaires → follow_up_questionnaires_legacy';
    ELSE
        RAISE NOTICE 'follow_up_questionnaires already absent or already renamed, skipping';
    END IF;
END $$;

COMMENT ON TABLE follow_up_questionnaires_legacy IS
    'Table legacy archivée le 2026-05-18 (P2.C.3). Plus aucun endpoint applicatif ne la lit/écrit. À droper après période d''observation.';

-- =====================================================
-- 2. Réécriture de get_patient_file_summary()
-- =====================================================
-- La signature reste identique pour ne pas casser l'API summary du
-- dossier. Seules les deux sous-requêtes sur pending/completed
-- questionnaires pointent vers questionnaire_responses (qui porte
-- déjà patient_id dénormalisé — pas de JOIN nécessaire).
CREATE OR REPLACE FUNCTION get_patient_file_summary(p_patient_id UUID)
RETURNS TABLE (
    anamnesis_status questionnaire_status,
    anamnesis_updated_at TIMESTAMPTZ,
    pending_questionnaires INTEGER,
    completed_questionnaires INTEGER,
    total_documents INTEGER,
    total_consultations INTEGER,
    last_consultation_date DATE,
    active_objectives INTEGER,
    objectives_on_track INTEGER,
    pending_changes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT status FROM anamneses WHERE patient_id = p_patient_id AND is_current = true) AS anamnesis_status,
        (SELECT updated_at FROM anamneses WHERE patient_id = p_patient_id AND is_current = true) AS anamnesis_updated_at,
        (SELECT COUNT(*)::INTEGER FROM questionnaire_responses WHERE patient_id = p_patient_id AND status = 'in_progress') AS pending_questionnaires,
        (SELECT COUNT(*)::INTEGER FROM questionnaire_responses WHERE patient_id = p_patient_id AND status = 'submitted') AS completed_questionnaires,
        (SELECT COUNT(*)::INTEGER FROM documents WHERE patient_id = p_patient_id AND deleted_at IS NULL) AS total_documents,
        (SELECT COUNT(*)::INTEGER FROM consultations WHERE patient_id = p_patient_id) AS total_consultations,
        (SELECT MAX(date) FROM consultations WHERE patient_id = p_patient_id) AS last_consultation_date,
        (SELECT COUNT(*)::INTEGER FROM patient_objectives WHERE patient_id = p_patient_id AND status NOT IN ('completed', 'abandoned')) AS active_objectives,
        (SELECT COUNT(*)::INTEGER FROM patient_objectives WHERE patient_id = p_patient_id AND status = 'on_track') AS objectives_on_track,
        (SELECT COUNT(*)::INTEGER FROM change_reports WHERE patient_id = p_patient_id AND status = 'pending') AS pending_changes;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. Drop questionnaire_assignments.legacy_source_id
-- =====================================================
-- La contrainte UNIQUE associée est automatiquement supprimée avec la
-- colonne (CASCADE implicite sur DROP COLUMN).
ALTER TABLE questionnaire_assignments
    DROP COLUMN IF EXISTS legacy_source_id;

-- =====================================================
-- Vérifications post-déploiement :
--
--   -- Plus de table active :
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name = 'follow_up_questionnaires';
--   -- (attendu : 0 ligne)
--
--   -- Table legacy archivée présente :
--   SELECT COUNT(*) FROM follow_up_questionnaires_legacy;
--
--   -- Colonne legacy_source_id retirée :
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'questionnaire_assignments' AND column_name = 'legacy_source_id';
--   -- (attendu : 0 ligne)
--
--   -- Fonction summary toujours fonctionnelle (remplacer l'UUID) :
--   SELECT * FROM get_patient_file_summary('<patient_user_id>');
-- =====================================================
