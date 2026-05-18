-- =====================================================
-- Migration: Fix RLS — qr_nutri_insert policy
-- Story: QUEST-ASSIGN-002
-- Date: 2026-05-17
-- =====================================================
-- Bug : lors de la création d'un assignment (côté nutritionniste),
-- l'API insère immédiatement une `questionnaire_responses` vide pour
-- que le patient puisse y écrire ses réponses. Mais P2.A n'a créé
-- qu'une policy INSERT côté patient (qr_patient_insert) qui exige
-- patient_id = auth.uid() — ce qui est faux quand c'est le
-- nutritionniste qui crée la réponse.
--
-- Fix : ajout d'une policy INSERT spécifique au nutritionniste,
-- vérifiant qu'il est propriétaire de l'assignment cible.
-- =====================================================

DROP POLICY IF EXISTS qr_nutri_insert ON questionnaire_responses;

CREATE POLICY qr_nutri_insert ON questionnaire_responses
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_assignments a
            WHERE a.id = assignment_id
              AND a.nutritionist_id = auth.uid()
              AND a.patient_id = questionnaire_responses.patient_id
        )
    );

COMMENT ON POLICY qr_nutri_insert ON questionnaire_responses IS
    'Autorise le nutritionniste à créer la réponse vide associée à un assignment qu''il vient de créer.';

-- =====================================================
-- Vérification post-déploiement
-- =====================================================
-- Liste les policies sur la table — doit contenir qr_nutri_insert :
--
--   SELECT polname, polcmd
--   FROM pg_policy
--   WHERE polrelid = 'questionnaire_responses'::regclass
--   ORDER BY polname;
-- =====================================================
