-- =====================================================
-- Migration: P2.A — Questionnaire assignments + responses
-- Epic: Templates de questionnaires patients
-- Story: QUEST-ASSIGN-001
-- Date: 2026-05-17
-- =====================================================
-- Adds the assignment / response model on top of the template catalog
-- shipped in P1. Phase 2.A ONLY adds the new tables and backfills the
-- existing follow_up_questionnaires rows. It does NOT touch the API
-- routes or the modal yet (P2.B) and does NOT yet expose the patient
-- response flow (P2.C). follow_up_questionnaires keeps working as
-- before during P2.A → P2.B transition.
--
-- Décisions architecturales :
--   - Ad-hoc questionnaires (créés sans template) seront représentés
--     par des templates personnels avec is_draft=true (Option 1.B).
--   - Backfill : toutes les lignes de follow_up_questionnaires.
--   - Auto-save côté patient : par réponse, debounce 800ms (P2.C).
--   - Expiration : aucune logique automatique pour l'instant (Option 4.C).
-- =====================================================

-- =====================================================
-- 1. ENUMS
-- =====================================================
DO $$ BEGIN
    CREATE TYPE questionnaire_assignment_status AS ENUM (
        'scheduled',
        'sent',
        'in_progress',
        'completed',
        'expired',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE questionnaire_response_status AS ENUM (
        'in_progress',
        'submitted'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- 2. EXTENSION DU SCHÉMA TEMPLATES (is_draft)
-- =====================================================
-- Décision 1.B : les questionnaires ad-hoc sont stockés comme des
-- templates personnels marqués is_draft=true → invisibles du picker
-- tant que le nutritionniste ne les a pas "promus" en template
-- réutilisable.
ALTER TABLE questionnaire_templates
    ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN questionnaire_templates.is_draft IS
    'true = template ad-hoc (créé à la volée pour un envoi), masqué du picker. false = template publié réutilisable.';

CREATE INDEX IF NOT EXISTS idx_qt_picker_visible
    ON questionnaire_templates(category, title)
    WHERE active = true AND is_draft = false;

-- =====================================================
-- 3. TABLES
-- =====================================================

-- ----- questionnaire_assignments --------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id UUID NOT NULL REFERENCES questionnaire_template_versions(id) ON DELETE RESTRICT,
    patient_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nutritionist_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- null = système (cron, event_triggered) ; sinon profile de qui a déclenché l'envoi.
    assigned_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- Lien optionnel à une consultation (préservé de follow_up_questionnaires).
    consultation_id     UUID REFERENCES consultations(id) ON DELETE SET NULL,
    status              questionnaire_assignment_status NOT NULL DEFAULT 'scheduled',
    scheduled_for       TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    due_at              TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    -- Trace de migration : pointe vers la ligne follow_up_questionnaires
    -- d'origine. Null pour tout nouvel assignment créé après P2.B.
    -- Sera supprimé une fois follow_up_questionnaires droppée (P2.C fin).
    legacy_source_id    UUID UNIQUE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE  questionnaire_assignments IS 'Un envoi de questionnaire à un patient. QUEST-ASSIGN-001';
COMMENT ON COLUMN questionnaire_assignments.template_version_id IS 'Version EXACTE du template au moment de l''envoi — garantit l''immuabilité des questions vues par le patient.';
COMMENT ON COLUMN questionnaire_assignments.legacy_source_id IS 'Trace de backfill depuis follow_up_questionnaires. À supprimer en fin de P2.C.';

CREATE INDEX IF NOT EXISTS idx_qa_patient        ON questionnaire_assignments(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_qa_nutritionist   ON questionnaire_assignments(nutritionist_id, status);
CREATE INDEX IF NOT EXISTS idx_qa_consultation   ON questionnaire_assignments(consultation_id) WHERE consultation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qa_due            ON questionnaire_assignments(due_at) WHERE status IN ('sent', 'in_progress');

-- ----- questionnaire_responses ----------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 1:1 avec l'assignment.
    assignment_id       UUID NOT NULL UNIQUE REFERENCES questionnaire_assignments(id) ON DELETE CASCADE,
    -- Dénormalisé pour les requêtes patient (évite un JOIN sur assignments).
    patient_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    template_version_id UUID NOT NULL REFERENCES questionnaire_template_versions(id) ON DELETE RESTRICT,
    status              questionnaire_response_status NOT NULL DEFAULT 'in_progress',
    submitted_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE  questionnaire_responses IS 'Réponse du patient à un assignment (1:1). status=in_progress tant que pas soumis.';

CREATE INDEX IF NOT EXISTS idx_qr_patient ON questionnaire_responses(patient_id, status);

-- ----- response_answers -----------------------------------------------
CREATE TABLE IF NOT EXISTS response_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id     UUID NOT NULL REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
    -- RESTRICT : on n'efface jamais une question référencée par une réponse —
    -- protège l'intégrité historique des dossiers patients.
    question_id     UUID NOT NULL REFERENCES questionnaire_questions(id) ON DELETE RESTRICT,
    -- Une seule de ces colonnes est non-null selon le type de question.
    value_numeric   NUMERIC,   -- scale, percent, number, bristol
    value_text      TEXT,      -- free_text
    value_time      TIME,      -- time
    value_option_id UUID REFERENCES questionnaire_question_options(id) ON DELETE RESTRICT,  -- single_choice
    answered_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (response_id, question_id)
);

COMMENT ON TABLE  response_answers IS 'Réponses individuelles à une question. Une seule colonne value_* est utilisée selon le type. multi_choice → voir response_answer_options.';

CREATE INDEX IF NOT EXISTS idx_ra_response       ON response_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_ra_question       ON response_answers(question_id);
-- Index spécialisé pour agrégation numérique (statistiques, alertes P3).
CREATE INDEX IF NOT EXISTS idx_ra_q_numeric      ON response_answers(question_id, value_numeric) WHERE value_numeric IS NOT NULL;

-- ----- response_answer_options ----------------------------------------
CREATE TABLE IF NOT EXISTS response_answer_options (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_answer_id UUID NOT NULL REFERENCES response_answers(id) ON DELETE CASCADE,
    option_id          UUID NOT NULL REFERENCES questionnaire_question_options(id) ON DELETE RESTRICT,
    UNIQUE (response_answer_id, option_id)
);

COMMENT ON TABLE  response_answer_options IS 'Options sélectionnées pour les questions multi_choice. Une ligne par option cochée.';

CREATE INDEX IF NOT EXISTS idx_rao_answer ON response_answer_options(response_answer_id);
CREATE INDEX IF NOT EXISTS idx_rao_option ON response_answer_options(option_id);

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================
-- Patient : voit/écrit ses données tant que la réponse est in_progress.
-- Nutritionniste : voit les données de ses patients (read-only sur
-- réponses ; les assignments sont en revanche modifiables par lui).
-- =====================================================

ALTER TABLE questionnaire_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_answers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_answer_options       ENABLE ROW LEVEL SECURITY;

-- ----- questionnaire_assignments --------------------------------------
DROP POLICY IF EXISTS qa_patient_read  ON questionnaire_assignments;
DROP POLICY IF EXISTS qa_nutri_rw      ON questionnaire_assignments;

CREATE POLICY qa_patient_read ON questionnaire_assignments
    FOR SELECT TO authenticated
    USING (patient_id = auth.uid());

CREATE POLICY qa_nutri_rw ON questionnaire_assignments
    FOR ALL TO authenticated
    USING (nutritionist_id = auth.uid())
    WITH CHECK (nutritionist_id = auth.uid());

-- ----- questionnaire_responses ----------------------------------------
DROP POLICY IF EXISTS qr_patient_select ON questionnaire_responses;
DROP POLICY IF EXISTS qr_patient_insert ON questionnaire_responses;
DROP POLICY IF EXISTS qr_patient_update ON questionnaire_responses;
DROP POLICY IF EXISTS qr_nutri_select   ON questionnaire_responses;
DROP POLICY IF EXISTS qr_nutri_insert   ON questionnaire_responses;

CREATE POLICY qr_patient_select ON questionnaire_responses
    FOR SELECT TO authenticated
    USING (patient_id = auth.uid());

CREATE POLICY qr_patient_insert ON questionnaire_responses
    FOR INSERT TO authenticated
    WITH CHECK (
        patient_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM questionnaire_assignments a
            WHERE a.id = assignment_id AND a.patient_id = auth.uid()
        )
    );

-- Patient peut PATCH sa réponse uniquement tant que pas soumise.
-- L'UPDATE → status='submitted' est autorisé par cette policy (le WITH CHECK
-- vérifie l'état de la NEW row qui sera submitted, mais USING vérifie l'OLD).
CREATE POLICY qr_patient_update ON questionnaire_responses
    FOR UPDATE TO authenticated
    USING (patient_id = auth.uid() AND status = 'in_progress')
    WITH CHECK (patient_id = auth.uid());

CREATE POLICY qr_nutri_select ON questionnaire_responses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_assignments a
            WHERE a.id = assignment_id AND a.nutritionist_id = auth.uid()
        )
    );

-- Le nutritionniste insère la réponse vide juste après la création de
-- l'assignment (pour que le patient ait quelque chose à compléter).
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

-- ----- response_answers -----------------------------------------------
DROP POLICY IF EXISTS ra_patient_rw   ON response_answers;
DROP POLICY IF EXISTS ra_nutri_read   ON response_answers;

CREATE POLICY ra_patient_rw ON response_answers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_responses r
            WHERE r.id = response_id AND r.patient_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_responses r
            WHERE r.id = response_id
              AND r.patient_id = auth.uid()
              AND r.status = 'in_progress'
        )
    );

CREATE POLICY ra_nutri_read ON response_answers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_responses r
            JOIN questionnaire_assignments a ON a.id = r.assignment_id
            WHERE r.id = response_id AND a.nutritionist_id = auth.uid()
        )
    );

-- ----- response_answer_options ----------------------------------------
DROP POLICY IF EXISTS rao_patient_rw  ON response_answer_options;
DROP POLICY IF EXISTS rao_nutri_read  ON response_answer_options;

CREATE POLICY rao_patient_rw ON response_answer_options
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM response_answers ra
            JOIN questionnaire_responses r ON r.id = ra.response_id
            WHERE ra.id = response_answer_id AND r.patient_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM response_answers ra
            JOIN questionnaire_responses r ON r.id = ra.response_id
            WHERE ra.id = response_answer_id
              AND r.patient_id = auth.uid()
              AND r.status = 'in_progress'
        )
    );

CREATE POLICY rao_nutri_read ON response_answer_options
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM response_answers ra
            JOIN questionnaire_responses r ON r.id = ra.response_id
            JOIN questionnaire_assignments a ON a.id = r.assignment_id
            WHERE ra.id = response_answer_id AND a.nutritionist_id = auth.uid()
        )
    );

-- =====================================================
-- 5. TRIGGERS — updated_at
-- =====================================================
DROP TRIGGER IF EXISTS questionnaire_assignments_updated_at ON questionnaire_assignments;
CREATE TRIGGER questionnaire_assignments_updated_at
    BEFORE UPDATE ON questionnaire_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS questionnaire_responses_updated_at ON questionnaire_responses;
CREATE TRIGGER questionnaire_responses_updated_at
    BEFORE UPDATE ON questionnaire_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS response_answers_updated_at ON response_answers;
CREATE TRIGGER response_answers_updated_at
    BEFORE UPDATE ON response_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 6. BACKFILL — follow_up_questionnaires → nouveau schéma
-- =====================================================
-- Stratégie :
--   1. Pour chaque ligne follow_up_questionnaires sans legacy_source_id
--      déjà migré (idempotent).
--   2. Trouve le nutritionniste du patient via patient_profiles.
--   3. Crée un template personnel is_draft=true (Option 1.B).
--   4. Crée la version 1 publiée.
--   5. Insère les questions depuis le JSONB (mapping de types ci-dessous).
--   6. Crée l'assignment + la response.
--   7. answers JSONB est ignoré (toujours NULL en pratique — voir commit
--      message). Si non-null en prod, une migration custom serait requise.
--
-- Mapping de types (ancien → nouveau) :
--   'text'    → 'free_text'
--   'scale'   → 'scale' (1-10 sans ancrage explicite)
--   'choice'  → 'single_choice' (multi non-distingué dans l'ancien modèle)
--   'boolean' → 'single_choice' (options Oui/Non)
--   'number'  → 'number'
-- =====================================================

CREATE OR REPLACE FUNCTION backfill_follow_up_questionnaires()
RETURNS TABLE(migrated INT, skipped_no_nutritionist INT, skipped_already_migrated INT) AS $$
DECLARE
    rec               RECORD;
    v_nutri_user_id   UUID;
    v_template_id     UUID;
    v_version_id      UUID;
    v_assignment_id   UUID;
    v_response_id     UUID;
    v_question        JSONB;
    v_q_index         INT;
    v_question_id     UUID;
    v_option          TEXT;
    v_opt_index       INT;
    v_mapped_type     questionnaire_question_type;
    v_assignment_st   questionnaire_assignment_status;
    v_response_st     questionnaire_response_status;
    v_count_mig       INT := 0;
    v_count_no_nut    INT := 0;
    v_count_already   INT := 0;
BEGIN
    FOR rec IN
        SELECT * FROM follow_up_questionnaires
        ORDER BY created_at ASC
    LOOP
        -- Idempotence : si déjà migré, skip
        IF EXISTS (
            SELECT 1 FROM questionnaire_assignments
            WHERE legacy_source_id = rec.id
        ) THEN
            v_count_already := v_count_already + 1;
            CONTINUE;
        END IF;

        -- Résolution du nutritionniste via patient_profiles → nutritionist_profiles
        SELECT np.user_id INTO v_nutri_user_id
        FROM patient_profiles pp
        JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
        WHERE pp.user_id = rec.patient_id
        LIMIT 1;

        IF v_nutri_user_id IS NULL THEN
            RAISE NOTICE 'Skipping questionnaire % : patient % sans nutritionniste assigné', rec.id, rec.patient_id;
            v_count_no_nut := v_count_no_nut + 1;
            CONTINUE;
        END IF;

        -- 1. Template personnel ad-hoc
        INSERT INTO questionnaire_templates
            (key, category, title, description,
             dispatch_mode, estimated_minutes,
             is_system, is_draft, active, created_by)
        VALUES (
            'legacy_' || replace(rec.id::text, '-', ''),
            'deep_dive',
            rec.title,
            'Migré depuis follow_up_questionnaires (' || rec.created_at::date || ').',
            'manual_only',
            NULL,
            false, true, true,
            v_nutri_user_id
        )
        RETURNING id INTO v_template_id;

        -- 2. Version 1 publiée
        INSERT INTO questionnaire_template_versions
            (template_id, version, is_published, published_at, notes)
        VALUES (v_template_id, 1, true, rec.created_at, 'Backfill follow_up_questionnaires')
        RETURNING id INTO v_version_id;

        -- 3. Questions depuis le JSONB
        v_q_index := 0;
        FOR v_question IN SELECT * FROM jsonb_array_elements(coalesce(rec.questions, '[]'::jsonb))
        LOOP
            v_q_index := v_q_index + 1;

            -- Mapping des types
            v_mapped_type := CASE v_question->>'type'
                WHEN 'text'    THEN 'free_text'::questionnaire_question_type
                WHEN 'scale'   THEN 'scale'::questionnaire_question_type
                WHEN 'choice'  THEN 'single_choice'::questionnaire_question_type
                WHEN 'boolean' THEN 'single_choice'::questionnaire_question_type
                WHEN 'number'  THEN 'number'::questionnaire_question_type
                ELSE 'free_text'::questionnaire_question_type  -- fallback safe
            END;

            INSERT INTO questionnaire_questions
                (template_version_id, key, position, label, type, is_required,
                 scale_min, scale_max)
            VALUES (
                v_version_id,
                'q_' || v_q_index,
                v_q_index,
                coalesce(v_question->>'question', '(question vide)'),
                v_mapped_type,
                coalesce((v_question->>'required')::boolean, false),
                -- Si scale, valeurs par défaut 1-10 ; sinon null
                CASE WHEN v_mapped_type = 'scale' THEN 1 ELSE NULL END,
                CASE WHEN v_mapped_type = 'scale' THEN 10 ELSE NULL END
            )
            RETURNING id INTO v_question_id;

            -- Options pour single_choice
            IF v_mapped_type = 'single_choice' THEN
                IF v_question->>'type' = 'boolean' THEN
                    -- Oui / Non hard-codé
                    INSERT INTO questionnaire_question_options
                        (question_id, value, label, position)
                    VALUES
                        (v_question_id, 'oui', 'Oui', 1),
                        (v_question_id, 'non', 'Non', 2);
                ELSE
                    -- Options depuis le JSONB choice
                    v_opt_index := 0;
                    FOR v_option IN
                        SELECT jsonb_array_elements_text(coalesce(v_question->'options', '[]'::jsonb))
                    LOOP
                        v_opt_index := v_opt_index + 1;
                        INSERT INTO questionnaire_question_options
                            (question_id, value, label, position)
                        VALUES (
                            v_question_id,
                            'opt_' || v_opt_index,
                            v_option,
                            v_opt_index
                        );
                    END LOOP;
                END IF;
            END IF;
        END LOOP;

        -- 4. Mapping des statuts
        v_assignment_st := CASE rec.status::text
            WHEN 'pending'   THEN 'sent'::questionnaire_assignment_status
            WHEN 'completed' THEN 'completed'::questionnaire_assignment_status
            ELSE 'sent'::questionnaire_assignment_status
        END;
        v_response_st := CASE rec.status::text
            WHEN 'completed' THEN 'submitted'::questionnaire_response_status
            ELSE 'in_progress'::questionnaire_response_status
        END;

        -- 5. Assignment (avec trace legacy_source_id)
        INSERT INTO questionnaire_assignments
            (template_version_id, patient_id, nutritionist_id,
             assigned_by, consultation_id, status,
             sent_at, due_at, completed_at,
             legacy_source_id, created_at, updated_at)
        VALUES (
            v_version_id,
            rec.patient_id,
            v_nutri_user_id,
            v_nutri_user_id,
            rec.consultation_id,
            v_assignment_st,
            rec.created_at,
            CASE WHEN rec.due_date IS NOT NULL THEN rec.due_date::timestamptz ELSE NULL END,
            rec.completed_at,
            rec.id,
            rec.created_at,
            rec.updated_at
        )
        RETURNING id INTO v_assignment_id;

        -- 6. Response (vide — answers JSONB ignoré, NULL en pratique)
        INSERT INTO questionnaire_responses
            (assignment_id, patient_id, template_version_id,
             status, submitted_at, created_at, updated_at)
        VALUES (
            v_assignment_id,
            rec.patient_id,
            v_version_id,
            v_response_st,
            rec.completed_at,
            rec.created_at,
            rec.updated_at
        )
        RETURNING id INTO v_response_id;

        v_count_mig := v_count_mig + 1;
    END LOOP;

    migrated := v_count_mig;
    skipped_no_nutritionist := v_count_no_nut;
    skipped_already_migrated := v_count_already;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Exécution immédiate du backfill ; affiche les compteurs en NOTICE.
DO $exec$
DECLARE
    res RECORD;
BEGIN
    SELECT * INTO res FROM backfill_follow_up_questionnaires();
    RAISE NOTICE 'Backfill terminé : % migrés · % skippés (pas de nutritionniste) · % déjà migrés',
        res.migrated, res.skipped_no_nutritionist, res.skipped_already_migrated;
END $exec$;

-- =====================================================
-- 7. VÉRIFICATION POST-DÉPLOIEMENT
-- =====================================================
-- Compare les counts pour valider que le backfill est complet :
--
--   SELECT
--     (SELECT COUNT(*) FROM follow_up_questionnaires) AS legacy_count,
--     (SELECT COUNT(*) FROM questionnaire_assignments WHERE legacy_source_id IS NOT NULL) AS migrated_count;
--
-- Les deux nombres doivent être identiques (à moins de patients sans
-- nutritionniste assigné — vérifier les NOTICE émis pendant le backfill).
-- =====================================================
