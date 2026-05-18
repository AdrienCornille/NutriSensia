-- =====================================================
-- Migration: Sync assignment.status quand response passe en `submitted`
-- Story: P2.C.3 — fix bug carte "Complété" non mise à jour
-- Date: 2026-05-18
-- =====================================================
-- Bug observé : après qu'un patient soumet son questionnaire, la carte côté
-- nutritionniste reste affichée "en attente" au lieu de passer "Complété".
--
-- Cause racine :
-- La route POST /api/protected/dossier/questionnaires/[assignmentId]/submit
-- fait deux UPDATE séquentiels :
--   1. questionnaire_responses    → status = 'submitted'  (OK, policy qr_patient_update couvre)
--   2. questionnaire_assignments  → status = 'completed'  (KO, aucune policy patient)
--
-- La table `questionnaire_assignments` n'expose au patient que `qa_patient_read`
-- (FOR SELECT). L'UPDATE silencieux retourne 0 rows affected sans erreur, donc
-- le mapper `assignmentToQuestionnaireDetail` continue de voir status='sent'
-- ou 'in_progress' → la carte reste affichée "pending".
--
-- Fix :
--   - Trigger AFTER UPDATE sur questionnaire_responses qui propage le passage
--     'in_progress' → 'submitted' vers l'assignment parent. SECURITY DEFINER
--     pour bypasser la RLS patient.
--   - Backfill : on rattrape les responses déjà submitted dont l'assignment
--     est resté coincé en non-completed (cas des envois faits avant ce fix).
--
-- Approche choisie vs. ajouter une policy UPDATE patient sur assignments :
-- moins de surface d'attaque (le patient ne peut toujours pas écrire dans
-- assignments à la main), et l'invariant "response.submitted ⇒ assignment.completed"
-- devient garanti côté DB plutôt que dépendant du code applicatif.
-- =====================================================

-- =====================================================
-- 1. Fonction trigger
-- =====================================================
CREATE OR REPLACE FUNCTION sync_assignment_on_response_submit()
RETURNS TRIGGER AS $$
BEGIN
    -- Ne réagit qu'au passage explicite vers 'submitted' (évite les boucles
    -- si on revient sur la response pour autre chose plus tard).
    IF NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM 'submitted' THEN
        UPDATE questionnaire_assignments
        SET status       = 'completed',
            completed_at = COALESCE(completed_at, NEW.submitted_at, now()),
            updated_at   = now()
        WHERE id = NEW.assignment_id
          AND status <> 'completed';  -- idempotent
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_assignment_on_response_submit() IS
    'Synchronise questionnaire_assignments.status = completed quand la response associée passe en submitted. SECURITY DEFINER pour bypasser la RLS patient sur la table assignments.';

-- =====================================================
-- 2. Trigger
-- =====================================================
DROP TRIGGER IF EXISTS trg_sync_assignment_on_response_submit
    ON questionnaire_responses;

CREATE TRIGGER trg_sync_assignment_on_response_submit
    AFTER UPDATE OF status ON questionnaire_responses
    FOR EACH ROW
    WHEN (NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM 'submitted')
    EXECUTE FUNCTION sync_assignment_on_response_submit();

-- =====================================================
-- 3. Backfill — rattrapage des assignments coincés
-- =====================================================
-- Pour chaque response déjà submitted dont l'assignment n'a jamais reçu
-- l'UPDATE (RLS rejection passée), on rattrape maintenant.
WITH stuck AS (
    SELECT a.id AS assignment_id, r.submitted_at
    FROM questionnaire_responses r
    JOIN questionnaire_assignments a ON a.id = r.assignment_id
    WHERE r.status = 'submitted'
      AND a.status <> 'completed'
)
UPDATE questionnaire_assignments a
SET status       = 'completed',
    completed_at = COALESCE(a.completed_at, s.submitted_at, now()),
    updated_at   = now()
FROM stuck s
WHERE a.id = s.assignment_id;

-- =====================================================
-- Vérifications post-déploiement :
--
--   -- Le trigger est attaché :
--   SELECT tgname FROM pg_trigger
--   WHERE tgrelid = 'questionnaire_responses'::regclass
--     AND tgname = 'trg_sync_assignment_on_response_submit';
--
--   -- Plus aucun écart response.submitted ↔ assignment.completed :
--   SELECT COUNT(*)
--   FROM questionnaire_responses r
--   JOIN questionnaire_assignments a ON a.id = r.assignment_id
--   WHERE r.status = 'submitted' AND a.status <> 'completed';
--   -- (attendu : 0)
-- =====================================================
