-- =====================================================
-- Migration: Questionnaire templates system (Phase 1)
-- Epic: Templates de questionnaires patients
-- Story: QUEST-TPL-001
-- Date: 2026-05-17
-- =====================================================
-- Adds a versioned template catalog for follow-up questionnaires.
-- Phase 1 only ships the structural tables + a system seed of 8 templates;
-- assignments / responses / dispatch / alerts arrive in phases 2 & 3.
--
-- Coexistence: this migration does NOT touch follow_up_questionnaires.
-- The existing flow keeps creating ad-hoc questionnaires; the new tables
-- only feed the "Use a template" pre-fill action in the modal.
-- =====================================================

-- =====================================================
-- 1. ENUMS
-- =====================================================
DO $$ BEGIN
    CREATE TYPE questionnaire_category AS ENUM (
        'regular_followup',
        'around_consultation',
        'deep_dive'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE questionnaire_dispatch_mode AS ENUM (
        'recurring',
        'event_triggered',
        'manual_only'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE questionnaire_question_type AS ENUM (
        'scale',
        'percent',
        'single_choice',
        'multi_choice',
        'free_text',
        'number',
        'time',
        'bristol'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE questionnaire_display_operator AS ENUM (
        'equals',
        'not_equals',
        'in',
        'greater_than',
        'less_than',
        'is_answered'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- 2. TABLES
-- =====================================================

-- ----- questionnaire_templates ----------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_templates (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key                   TEXT NOT NULL UNIQUE,
    category              questionnaire_category NOT NULL,
    title                 TEXT NOT NULL,
    description           TEXT,
    dispatch_mode         questionnaire_dispatch_mode NOT NULL,
    is_sensitive          BOOLEAN NOT NULL DEFAULT false,
    is_clinical_screening BOOLEAN NOT NULL DEFAULT false,
    estimated_minutes     INTEGER,
    active                BOOLEAN NOT NULL DEFAULT true,
    is_system             BOOLEAN NOT NULL DEFAULT false,
    -- CASCADE: si un nutritionniste est supprimé, ses templates personnels le suivent.
    -- Évite que le CHECK qt_ownership_consistent soit violé par un SET NULL.
    created_by            UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now(),
    -- A user-created template MUST have an owner; system templates have none.
    CONSTRAINT qt_ownership_consistent CHECK (
        (is_system = true  AND created_by IS NULL)
     OR (is_system = false AND created_by IS NOT NULL)
    )
);

COMMENT ON TABLE  questionnaire_templates IS 'Catalogue de templates de questionnaires (système + nutritionniste). QUEST-TPL-001';
COMMENT ON COLUMN questionnaire_templates.key IS 'Identifiant stable lisible (ex: weekly_wellbeing) — utilisé dans le code TS';
COMMENT ON COLUMN questionnaire_templates.is_system IS 'true = template curé fourni par NutriSensia (lecture seule). false = créé par un nutritionniste.';
COMMENT ON COLUMN questionnaire_templates.is_sensitive IS 'Données de santé sensibles — intro de consentement + LPD à afficher côté patient.';
COMMENT ON COLUMN questionnaire_templates.is_clinical_screening IS 'Outil de dépistage clinique — score JAMAIS visible patient, interprétation nutritionniste uniquement.';
COMMENT ON COLUMN questionnaire_templates.dispatch_mode IS 'recurring=cron · event_triggered=hook événement · manual_only=envoi sur décision';

CREATE INDEX IF NOT EXISTS idx_qt_category    ON questionnaire_templates(category);
CREATE INDEX IF NOT EXISTS idx_qt_active      ON questionnaire_templates(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_qt_created_by  ON questionnaire_templates(created_by) WHERE is_system = false;

-- ----- questionnaire_template_versions --------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_template_versions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id  UUID NOT NULL REFERENCES questionnaire_templates(id) ON DELETE CASCADE,
    version      INTEGER NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    notes        TEXT,
    created_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (template_id, version)
);

COMMENT ON TABLE  questionnaire_template_versions IS 'Versions immuables d''un template — permet d''ancrer un assignment à une version précise.';
COMMENT ON COLUMN questionnaire_template_versions.is_published IS 'true = version disponible pour assignment. false = brouillon.';

CREATE INDEX IF NOT EXISTS idx_qtv_template ON questionnaire_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_qtv_published ON questionnaire_template_versions(template_id) WHERE is_published = true;

-- ----- questionnaire_questions ----------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id UUID NOT NULL REFERENCES questionnaire_template_versions(id) ON DELETE CASCADE,
    key                 TEXT NOT NULL,
    position            INTEGER NOT NULL,
    label               TEXT NOT NULL,
    help_text           TEXT,
    type                questionnaire_question_type NOT NULL,
    is_required         BOOLEAN NOT NULL DEFAULT false,
    is_scored           BOOLEAN NOT NULL DEFAULT false,
    scale_min           INTEGER,
    scale_max           INTEGER,
    scale_min_label     TEXT,
    scale_max_label     TEXT,
    number_min          NUMERIC,
    number_max          NUMERIC,
    UNIQUE (template_version_id, key),
    UNIQUE (template_version_id, position)
);

COMMENT ON TABLE  questionnaire_questions IS 'Questions d''une version de template. Position définit l''ordre d''affichage.';
COMMENT ON COLUMN questionnaire_questions.key IS 'Identifiant stable de la question dans une version (ex: energy, mood) — sert d''ancre pour les display_rules.';
COMMENT ON COLUMN questionnaire_questions.is_scored IS 'true = la question participe au score de dépistage (cf. template_scoring_rules).';

CREATE INDEX IF NOT EXISTS idx_qq_version ON questionnaire_questions(template_version_id, position);

-- ----- questionnaire_question_options ---------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_question_options (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id  UUID NOT NULL REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
    value        TEXT NOT NULL,
    label        TEXT NOT NULL,
    position     INTEGER NOT NULL,
    score_value  NUMERIC,
    is_exclusive BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (question_id, value),
    UNIQUE (question_id, position)
);

COMMENT ON TABLE  questionnaire_question_options IS 'Options pour les questions single_choice / multi_choice.';
COMMENT ON COLUMN questionnaire_question_options.value IS 'Valeur stockée (slug stable). Le label est l''affichage patient.';
COMMENT ON COLUMN questionnaire_question_options.is_exclusive IS 'multi_choice : si cochée, vide les autres (ex: "Aucun").';

CREATE INDEX IF NOT EXISTS idx_qqo_question ON questionnaire_question_options(question_id, position);

-- ----- questionnaire_question_display_rules ---------------------------
CREATE TABLE IF NOT EXISTS questionnaire_question_display_rules (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id            UUID NOT NULL REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
    depends_on_question_id UUID NOT NULL REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
    operator               questionnaire_display_operator NOT NULL,
    expected_value         JSONB,
    created_at             TIMESTAMPTZ DEFAULT now(),
    CHECK (question_id <> depends_on_question_id)
);

COMMENT ON TABLE  questionnaire_question_display_rules IS 'Branchements conditionnels — plusieurs lignes = ET logique. Une question n''apparaît que si toutes ses règles sont satisfaites.';

CREATE INDEX IF NOT EXISTS idx_qqdr_question      ON questionnaire_question_display_rules(question_id);
CREATE INDEX IF NOT EXISTS idx_qqdr_depends_on    ON questionnaire_question_display_rules(depends_on_question_id);

-- ----- questionnaire_template_scoring_rules ---------------------------
CREATE TABLE IF NOT EXISTS questionnaire_template_scoring_rules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id UUID NOT NULL UNIQUE REFERENCES questionnaire_template_versions(id) ON DELETE CASCADE,
    method              TEXT NOT NULL DEFAULT 'count_matching',
    match_value         TEXT NOT NULL,
    threshold           INTEGER NOT NULL,
    is_patient_visible  BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE  questionnaire_template_scoring_rules IS 'Règles de score (dépistage type SCOFF). Verrou is_patient_visible=false par défaut.';
COMMENT ON COLUMN questionnaire_template_scoring_rules.is_patient_visible IS 'SÉCURITÉ : false par défaut. Le score d''un dépistage clinique ne doit JAMAIS être affiché au patient.';

-- =====================================================
-- 3. RLS POLICIES + SECURITY DEFINER HELPERS
-- =====================================================
-- Principe : système visible par tous les nutritionnistes ; templates
-- nutritionniste visibles uniquement par leur créateur. Les patients
-- voient les templates auxquels ils sont assignés (via les helpers
-- SECURITY DEFINER ci-dessous, qui évitent la récursion RLS).
-- =====================================================

-- Helpers SECURITY DEFINER : exécutent le lookup avec les privilèges du
-- propriétaire, ce qui bypasse la RLS et casse la récursion qui se
-- produirait si une policy template interrogeait la table versions
-- (qui elle-même interrogerait templates).
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

GRANT EXECUTE ON FUNCTION patient_can_read_questionnaire_template(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION patient_can_read_questionnaire_version(uuid)  TO authenticated;
GRANT EXECUTE ON FUNCTION patient_can_read_questionnaire_question(uuid) TO authenticated;

ALTER TABLE questionnaire_templates                ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_template_versions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_questions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_question_options         ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_question_display_rules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_template_scoring_rules   ENABLE ROW LEVEL SECURITY;

-- ----- questionnaire_templates ----------------------------------------
DROP POLICY IF EXISTS qt_read           ON questionnaire_templates;
DROP POLICY IF EXISTS qt_nutri_insert   ON questionnaire_templates;
DROP POLICY IF EXISTS qt_nutri_update   ON questionnaire_templates;
DROP POLICY IF EXISTS qt_nutri_delete   ON questionnaire_templates;

CREATE POLICY qt_read ON questionnaire_templates
    FOR SELECT TO authenticated
    USING (
        is_system = true
        OR created_by = auth.uid()
        -- Patients see templates they've been assigned to (P2.A bridge).
        -- Uses a SECURITY DEFINER helper to break the RLS recursion that
        -- would otherwise occur between qt_read and qtv_read.
        OR patient_can_read_questionnaire_template(id)
    );

CREATE POLICY qt_nutri_insert ON questionnaire_templates
    FOR INSERT TO authenticated
    WITH CHECK (
        is_system = false
        AND created_by = auth.uid()
        AND EXISTS (SELECT 1 FROM nutritionist_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY qt_nutri_update ON questionnaire_templates
    FOR UPDATE TO authenticated
    USING (is_system = false AND created_by = auth.uid())
    WITH CHECK (is_system = false AND created_by = auth.uid());

CREATE POLICY qt_nutri_delete ON questionnaire_templates
    FOR DELETE TO authenticated
    USING (is_system = false AND created_by = auth.uid());

-- ----- questionnaire_template_versions --------------------------------
DROP POLICY IF EXISTS qtv_read          ON questionnaire_template_versions;
DROP POLICY IF EXISTS qtv_nutri_write   ON questionnaire_template_versions;

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

CREATE POLICY qtv_nutri_write ON questionnaire_template_versions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_templates t
            WHERE t.id = template_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_templates t
            WHERE t.id = template_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    );

-- ----- questionnaire_questions ----------------------------------------
DROP POLICY IF EXISTS qq_read           ON questionnaire_questions;
DROP POLICY IF EXISTS qq_nutri_write    ON questionnaire_questions;

CREATE POLICY qq_read ON questionnaire_questions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_template_versions v
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE v.id = template_version_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
        OR patient_can_read_questionnaire_question(id)
    );

CREATE POLICY qq_nutri_write ON questionnaire_questions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_template_versions v
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE v.id = template_version_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_template_versions v
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE v.id = template_version_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    );

-- ----- questionnaire_question_options ---------------------------------
DROP POLICY IF EXISTS qqo_read          ON questionnaire_question_options;
DROP POLICY IF EXISTS qqo_nutri_write   ON questionnaire_question_options;

CREATE POLICY qqo_read ON questionnaire_question_options
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
        OR patient_can_read_questionnaire_question(question_id)
    );

CREATE POLICY qqo_nutri_write ON questionnaire_question_options
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    );

-- ----- questionnaire_question_display_rules ---------------------------
DROP POLICY IF EXISTS qqdr_read         ON questionnaire_question_display_rules;
DROP POLICY IF EXISTS qqdr_nutri_write  ON questionnaire_question_display_rules;

CREATE POLICY qqdr_read ON questionnaire_question_display_rules
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
        OR patient_can_read_questionnaire_question(question_id)
    );

CREATE POLICY qqdr_nutri_write ON questionnaire_question_display_rules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_questions q
            JOIN questionnaire_template_versions v ON v.id = q.template_version_id
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE q.id = question_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    );

-- ----- questionnaire_template_scoring_rules ---------------------------
DROP POLICY IF EXISTS qtsr_read         ON questionnaire_template_scoring_rules;
DROP POLICY IF EXISTS qtsr_nutri_write  ON questionnaire_template_scoring_rules;

CREATE POLICY qtsr_read ON questionnaire_template_scoring_rules
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_template_versions v
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE v.id = template_version_id
              AND (t.is_system = true OR t.created_by = auth.uid())
        )
    );

CREATE POLICY qtsr_nutri_write ON questionnaire_template_scoring_rules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_template_versions v
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE v.id = template_version_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_template_versions v
            JOIN questionnaire_templates t ON t.id = v.template_id
            WHERE v.id = template_version_id
              AND t.is_system = false
              AND t.created_by = auth.uid()
        )
    );

-- =====================================================
-- 4. TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS questionnaire_templates_updated_at ON questionnaire_templates;
CREATE TRIGGER questionnaire_templates_updated_at
    BEFORE UPDATE ON questionnaire_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 5. SEED — 8 system templates (idempotent)
-- =====================================================
-- Each block:
--   1. Returns early if the template key already exists
--   2. Inserts the template (is_system=true, created_by=NULL)
--   3. Inserts version 1 (is_published=true, published_at=now())
--   4. Inserts questions, options, display rules, scoring rules
-- =====================================================

-- ----- T1. Bien-être hebdomadaire -----------------------------------
DO $seed$
DECLARE
    v_tmpl   UUID;
    v_ver    UUID;
    v_sleep  UUID;
    v_diff   UUID;
    v_detail UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'weekly_wellbeing') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description, dispatch_mode, estimated_minutes, is_system)
    VALUES
        ('weekly_wellbeing', 'regular_followup',
         'Bien-être hebdomadaire',
         'Court (5 questions) envoyé chaque dimanche soir. Détecte les dérives sans noyer le patient.',
         'recurring', 1, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'Version initiale')
    RETURNING id INTO v_ver;

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, scale_min, scale_max, scale_min_label, scale_max_label)
    VALUES (v_ver, 'energy', 1,
            'Comment évaluez-vous votre énergie cette semaine ?',
            'scale', true, 0, 10, 'épuisé', 'pleine forme');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, scale_min, scale_max, scale_min_label, scale_max_label)
    VALUES (v_ver, 'mood', 2,
            'Et votre humeur générale cette semaine ?',
            'scale', true, 0, 10, 'très bas', 'très bien');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'sleep', 3,
            'Comment était votre sommeil ces 7 derniers jours ?',
            'single_choice', true)
    RETURNING id INTO v_sleep;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_sleep, 'tres_bon',     'Très bon',     1),
        (v_sleep, 'bon',          'Bon',          2),
        (v_sleep, 'moyen',        'Moyen',        3),
        (v_sleep, 'mauvais',      'Mauvais',      4),
        (v_sleep, 'tres_mauvais', 'Très mauvais', 5);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'plan_difficulty', 4,
            'Avez-vous rencontré des difficultés avec votre plan alimentaire cette semaine ?',
            'single_choice', true)
    RETURNING id INTO v_diff;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_diff, 'aucune',      'Aucune',        1),
        (v_diff, 'quelques',    'Quelques-unes', 2),
        (v_diff, 'importantes', 'Importantes',   3);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'plan_difficulty_detail', 5,
            'Lesquelles, en quelques mots ?',
            'free_text', false)
    RETURNING id INTO v_detail;

    -- Branchement : Q5 n'apparaît que si Q4 != 'aucune'
    INSERT INTO questionnaire_question_display_rules
        (question_id, depends_on_question_id, operator, expected_value)
    VALUES (v_detail, v_diff, 'not_equals', '"aucune"'::jsonb);
END $seed$;

-- ----- T2. Suivi mensuel approfondi ---------------------------------
DO $seed$
DECLARE
    v_tmpl     UUID;
    v_ver      UUID;
    v_activity UUID;
    v_water    UUID;
    v_relation UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'monthly_followup') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description, dispatch_mode, estimated_minutes, is_system)
    VALUES
        ('monthly_followup', 'regular_followup',
         'Suivi mensuel approfondi',
         '~9 questions, début de mois. Photo complète avant la consultation suivante.',
         'recurring', 4, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'Version initiale')
    RETURNING id INTO v_ver;

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, scale_min, scale_max, scale_min_label, scale_max_label)
    VALUES (v_ver, 'progress', 1,
            'Comment évaluez-vous votre progression vers vos objectifs ce mois-ci ?',
            'scale', true, 0, 10, 'aucune progression', 'objectifs atteints');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'successes', 2,
            'Quels succès, même petits, retenez-vous de ce mois ?',
            'free_text', false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'obstacles', 3,
            'Quels obstacles avez-vous rencontrés ce mois-ci ?',
            'free_text', false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'activity_level', 4,
            'Votre niveau d''activité physique sur le mois',
            'single_choice', false)
    RETURNING id INTO v_activity;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_activity, 'sedentaire', 'Sédentaire', 1),
        (v_activity, 'leger',      'Léger',      2),
        (v_activity, 'modere',     'Modéré',     3),
        (v_activity, 'intense',    'Intense',    4);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, number_min, number_max)
    VALUES (v_ver, 'active_days_per_week', 5,
            'En moyenne, combien de jours/semaine avez-vous été actif ce mois-ci ?',
            'number', false, 0, 7);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, number_min)
    VALUES (v_ver, 'meals_outside', 6,
            'Repas pris à l''extérieur, en moyenne par semaine ce mois-ci',
            'number', false, 0);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'water_intake', 7,
            'Consommation d''eau quotidienne moyenne ce mois-ci',
            'single_choice', false)
    RETURNING id INTO v_water;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_water, 'lt_1l',      '< 1 L',       1),
        (v_water, '1_1_5l',     '1 - 1.5 L',   2),
        (v_water, '1_5_2l',     '1.5 - 2 L',   3),
        (v_water, 'gt_2l',      '> 2 L',       4);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'food_relationship', 8,
            'Comment décririez-vous votre relation à la nourriture ce mois-ci ?',
            'single_choice', false)
    RETURNING id INTO v_relation;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_relation, 'apaisee',      'Apaisée',      1),
        (v_relation, 'neutre',       'Neutre',       2),
        (v_relation, 'tendue',       'Tendue',       3),
        (v_relation, 'preoccupante', 'Préoccupante', 4);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'next_consult_topics', 9,
            'Avez-vous des questions à aborder lors de la prochaine consultation ?',
            'free_text', false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'next_month_focus', 10,
            'Sur quoi aimeriez-vous vous concentrer le mois prochain ?',
            'free_text', false);
END $seed$;

-- ----- T3. Adhésion plan alimentaire --------------------------------
DO $seed$
DECLARE
    v_tmpl     UUID;
    v_ver      UUID;
    v_blockers UUID;
    v_prep     UUID;
    v_taste    UUID;
    v_adjust   UUID;
    v_adj_dt   UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'plan_adherence') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description, dispatch_mode, estimated_minutes, is_system)
    VALUES
        ('plan_adherence', 'regular_followup',
         'Adhésion plan alimentaire',
         'Envoyé 2 semaines après remise d''un nouveau plan. Permet d''ajuster avant que le patient décroche.',
         'event_triggered', 3, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'Version initiale')
    RETURNING id INTO v_ver;

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, number_min, number_max)
    VALUES (v_ver, 'adherence_percent', 1,
            'Sur les 2 dernières semaines, à quel point avez-vous pu suivre le plan ?',
            'percent', true, 0, 100);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'favorite_meals', 2,
            'Quels repas du plan avez-vous le plus appréciés ?',
            'free_text', false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'hard_meals', 3,
            'Quels repas sont les plus difficiles à suivre ?',
            'free_text', false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'main_blockers', 4,
            'Quel est votre principal frein à l''adhésion ?',
            'multi_choice', false)
    RETURNING id INTO v_blockers;
    INSERT INTO questionnaire_question_options (question_id, value, label, position, is_exclusive) VALUES
        (v_blockers, 'time',         'Temps de préparation', 1, false),
        (v_blockers, 'budget',       'Budget',               2, false),
        (v_blockers, 'taste',        'Goût',                 3, false),
        (v_blockers, 'organisation', 'Organisation',         4, false),
        (v_blockers, 'satiety',      'Faim / satiété',       5, false),
        (v_blockers, 'social',       'Contexte social',      6, false),
        (v_blockers, 'none',         'Aucun',                7, true),
        (v_blockers, 'other',        'Autre',                8, false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'prep_time', 5,
            'Le temps de préparation vous convient-il ?',
            'single_choice', false)
    RETURNING id INTO v_prep;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_prep, 'too_short', 'Trop court', 1),
        (v_prep, 'fits',      'Adapté',     2),
        (v_prep, 'too_long',  'Trop long',  3);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'taste_match', 6,
            'Le plan correspond-il à vos goûts ?',
            'single_choice', false)
    RETURNING id INTO v_taste;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_taste, 'perfectly',  'Parfaitement', 1),
        (v_taste, 'well',       'Bien',         2),
        (v_taste, 'moderately', 'Moyennement',  3),
        (v_taste, 'not_really', 'Pas vraiment', 4);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'wants_adjustment', 7,
            'Souhaitez-vous un ajustement ?',
            'single_choice', true)
    RETURNING id INTO v_adjust;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_adjust, 'oui', 'Oui', 1),
        (v_adjust, 'non', 'Non', 2);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'adjustment_detail', 8,
            'Lequel ?',
            'free_text', false)
    RETURNING id INTO v_adj_dt;
    INSERT INTO questionnaire_question_display_rules
        (question_id, depends_on_question_id, operator, expected_value)
    VALUES (v_adj_dt, v_adjust, 'equals', '"oui"'::jsonb);
END $seed$;

-- ----- T4. Préparation consultation ---------------------------------
DO $seed$
DECLARE
    v_tmpl   UUID;
    v_ver    UUID;
    v_topics UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'consultation_prep') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description, dispatch_mode, estimated_minutes, is_system)
    VALUES
        ('consultation_prep', 'around_consultation',
         'Préparation consultation',
         'Envoyé 48 h avant le RDV. Le nutritionniste arrive préparé, le patient gagne du temps en cabinet.',
         'event_triggered', 2, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'Version initiale')
    RETURNING id INTO v_ver;

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'focus_topics', 1,
            'Sur quels sujets voulez-vous mettre l''accent lors de la consultation ?',
            'multi_choice', true)
    RETURNING id INTO v_topics;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_topics, 'plan',       'Plan alimentaire',  1),
        (v_topics, 'activity',   'Activité physique', 2),
        (v_topics, 'sleep',      'Sommeil',           3),
        (v_topics, 'stress',     'Stress',            4),
        (v_topics, 'digestion',  'Digestion',         5),
        (v_topics, 'weight',     'Poids',             6),
        (v_topics, 'habits',     'Habitudes',         7),
        (v_topics, 'motivation', 'Motivation',        8),
        (v_topics, 'other',      'Autre',             9);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, scale_min, scale_max, scale_min_label, scale_max_label)
    VALUES (v_ver, 'overall_feeling', 2,
            'Votre ressenti général depuis la dernière consultation',
            'scale', false, 0, 10, 'très difficile', 'très bien');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, help_text)
    VALUES (v_ver, 'changes_to_report', 3,
            'Avez-vous des changements à signaler depuis la dernière fois ?',
            'free_text', false,
            'Médicaments, événement de vie, maladie, nouveaux symptômes…');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'main_question', 4,
            'Quelle est votre question principale pour cette consultation ?',
            'free_text', true);
END $seed$;

-- ----- T5. Feedback post-consultation -------------------------------
DO $seed$
DECLARE
    v_tmpl    UUID;
    v_ver     UUID;
    v_compre  UUID;
    v_unclear UUID;
    v_time    UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'consultation_feedback') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description, dispatch_mode, estimated_minutes, is_system)
    VALUES
        ('consultation_feedback', 'around_consultation',
         'Feedback post-consultation',
         'Envoyé 24 h après le RDV. Mesure compréhension + satisfaction, base de qualité.',
         'event_triggered', 2, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'Version initiale')
    RETURNING id INTO v_ver;

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, scale_min, scale_max, scale_min_label, scale_max_label)
    VALUES (v_ver, 'usefulness', 1,
            'Comment évaluez-vous cette consultation ?',
            'scale', true, 0, 10, 'pas utile', 'très utile');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'understanding', 2,
            'Avez-vous bien compris les recommandations ?',
            'single_choice', true)
    RETURNING id INTO v_compre;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_compre, 'very_clear',   'Très clairement',       1),
        (v_compre, 'mostly',       'Plutôt oui',            2),
        (v_compre, 'some_unclear', 'Quelques zones d''ombre', 3),
        (v_compre, 'not_really',   'Pas vraiment',          4);

    -- Branchement : Q3 (what_remains_unclear) suit immédiatement Q2 quand
    -- la réponse est "some_unclear" ou "not_really". Positionnée AVANT
    -- time_fit pour rester accolée à son parent quand elle apparaît.
    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'what_remains_unclear', 3,
            'Qu''est-ce qui reste flou ?',
            'free_text', false)
    RETURNING id INTO v_unclear;
    INSERT INTO questionnaire_question_display_rules
        (question_id, depends_on_question_id, operator, expected_value)
    VALUES (v_unclear, v_compre, 'in', '["some_unclear","not_really"]'::jsonb);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'time_fit', 4,
            'Le temps consacré était-il adapté ?',
            'single_choice', false)
    RETURNING id INTO v_time;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_time, 'too_short', 'Trop court', 1),
        (v_time, 'fits',      'Adapté',     2),
        (v_time, 'too_long',  'Trop long',  3);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'priority_action', 5,
            'Quelle action allez-vous mettre en place en priorité ?',
            'free_text', false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'improvement', 6,
            'Quelque chose à améliorer pour la prochaine fois ?',
            'free_text', false);
END $seed$;

-- ----- T6. Habitudes alimentaires détaillées -----------------------
DO $seed$
DECLARE
    v_tmpl     UUID;
    v_ver      UUID;
    v_break    UUID;
    v_brk_time UUID;
    v_distrac  UUID;
    v_speed    UUID;
    v_satiety  UUID;
    v_outside  UUID;
    v_out_sit  UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'eating_habits_detail') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description, dispatch_mode, estimated_minutes, is_system)
    VALUES
        ('eating_habits_detail', 'deep_dive',
         'Habitudes alimentaires détaillées',
         'Complément d''anamnèse, en début de prise en charge ou avant un changement de plan majeur.',
         'manual_only', 4, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'Version initiale')
    RETURNING id INTO v_ver;

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'breakfast', 1,
            'Prenez-vous un petit-déjeuner ?',
            'single_choice', true)
    RETURNING id INTO v_break;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_break, 'daily',  'Oui, tous les jours',     1),
        (v_break, 'mostly', 'La plupart des jours',    2),
        (v_break, 'rarely', 'Rarement',                3),
        (v_break, 'never',  'Jamais',                  4);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'breakfast_time', 2,
            'Vers quelle heure, en général ?',
            'time', false)
    RETURNING id INTO v_brk_time;
    INSERT INTO questionnaire_question_display_rules
        (question_id, depends_on_question_id, operator, expected_value)
    VALUES (v_brk_time, v_break, 'not_equals', '"never"'::jsonb);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, number_min)
    VALUES (v_ver, 'meals_per_day', 3,
            'Combien de repas + collations par jour en moyenne ?',
            'number', false, 0);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, help_text)
    VALUES (v_ver, 'distracted_eating', 4,
            'Mangez-vous en faisant autre chose (TV, téléphone, travail) ?',
            'single_choice', false,
            null)
    RETURNING id INTO v_distrac;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_distrac, 'never',     'Jamais',     1),
        (v_distrac, 'rarely',    'Rarement',   2),
        (v_distrac, 'sometimes', 'Parfois',    3),
        (v_distrac, 'often',     'Souvent',    4),
        (v_distrac, 'always',    'Toujours',   5);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'eating_speed', 5,
            'À quelle vitesse mangez-vous ?',
            'single_choice', false)
    RETURNING id INTO v_speed;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_speed, 'very_slow',     'Très lentement', 1),
        (v_speed, 'slow',          'Lentement',      2),
        (v_speed, 'moderate',      'Modérément',     3),
        (v_speed, 'fast',          'Rapidement',     4),
        (v_speed, 'very_fast',     'Très rapidement',5);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'satiety_feeling', 6,
            'Vous sentez-vous rassasié(e) en fin de repas ?',
            'single_choice', false)
    RETURNING id INTO v_satiety;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_satiety, 'always',    'Toujours',  1),
        (v_satiety, 'often',     'Souvent',   2),
        (v_satiety, 'sometimes', 'Parfois',   3),
        (v_satiety, 'rarely',    'Rarement',  4),
        (v_satiety, 'never',     'Jamais',    5);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'eating_outside_meals', 7,
            'Mangez-vous en dehors des repas ?',
            'single_choice', false)
    RETURNING id INTO v_outside;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_outside, 'never',     'Jamais',    1),
        (v_outside, 'rarely',    'Rarement',  2),
        (v_outside, 'sometimes', 'Parfois',   3),
        (v_outside, 'often',     'Souvent',   4),
        (v_outside, 'always',    'Toujours',  5);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'outside_situations', 8,
            'Dans quelles situations, surtout ?',
            'multi_choice', false)
    RETURNING id INTO v_out_sit;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_out_sit, 'ennui',    'Ennui',     1),
        (v_out_sit, 'stress',   'Stress',    2),
        (v_out_sit, 'emotion',  'Émotion',   3),
        (v_out_sit, 'fatigue',  'Fatigue',   4),
        (v_out_sit, 'faim',     'Faim',      5),
        (v_out_sit, 'habitude', 'Habitude',  6),
        (v_out_sit, 'autre',    'Autre',     7);
    INSERT INTO questionnaire_question_display_rules
        (question_id, depends_on_question_id, operator, expected_value)
    VALUES (v_out_sit, v_outside, 'not_equals', '"never"'::jsonb);
END $seed$;

-- ----- T7. SCOFF screening (INACTIVE pending P3 safety net) ---------
DO $seed$
DECLARE
    v_tmpl  UUID;
    v_ver   UUID;
    v_q1    UUID;
    v_q2    UUID;
    v_q3    UUID;
    v_q4    UUID;
    v_q5    UUID;
    v_q6    UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'scoff_screening') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description,
         dispatch_mode, estimated_minutes,
         is_system, active, is_sensitive, is_clinical_screening)
    VALUES
        ('scoff_screening', 'deep_dive',
         'Comportement alimentaire — dépistage',
         'Outil clinique (SCOFF). À envoyer uniquement sur décision clinique, avec protocole de suivi défini AVANT envoi. Le score n''est jamais affiché au patient. INACTIVE tant que le filet de sécurité (P3) n''est pas livré.',
         'manual_only', 2,
         true, false, true, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'SCOFF FR — formulation à valider avant activation')
    RETURNING id INTO v_ver;

    -- 5 items SCOFF — chaque "oui" = 1 point au score
    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, is_scored)
    VALUES (v_ver, 'scoff_sick', 1,
            'Vous faites-vous parfois vomir parce que vous vous sentez mal d''avoir trop mangé ?',
            'single_choice', true, true)
    RETURNING id INTO v_q1;
    INSERT INTO questionnaire_question_options (question_id, value, label, position, score_value) VALUES
        (v_q1, 'oui', 'Oui', 1, 1),
        (v_q1, 'non', 'Non', 2, 0);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, is_scored)
    VALUES (v_ver, 'scoff_control', 2,
            'Craignez-vous d''avoir perdu le contrôle des quantités que vous mangez ?',
            'single_choice', true, true)
    RETURNING id INTO v_q2;
    INSERT INTO questionnaire_question_options (question_id, value, label, position, score_value) VALUES
        (v_q2, 'oui', 'Oui', 1, 1),
        (v_q2, 'non', 'Non', 2, 0);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, is_scored)
    VALUES (v_ver, 'scoff_one_stone', 3,
            'Avez-vous récemment perdu plus de 6 kg en moins de 3 mois ?',
            'single_choice', true, true)
    RETURNING id INTO v_q3;
    INSERT INTO questionnaire_question_options (question_id, value, label, position, score_value) VALUES
        (v_q3, 'oui', 'Oui', 1, 1),
        (v_q3, 'non', 'Non', 2, 0);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, is_scored)
    VALUES (v_ver, 'scoff_fat', 4,
            'Pensez-vous être trop gros(se) alors que d''autres vous trouvent mince ?',
            'single_choice', true, true)
    RETURNING id INTO v_q4;
    INSERT INTO questionnaire_question_options (question_id, value, label, position, score_value) VALUES
        (v_q4, 'oui', 'Oui', 1, 1),
        (v_q4, 'non', 'Non', 2, 0);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, is_scored)
    VALUES (v_ver, 'scoff_food', 5,
            'Diriez-vous que la nourriture domine votre vie ?',
            'single_choice', true, true)
    RETURNING id INTO v_q5;
    INSERT INTO questionnaire_question_options (question_id, value, label, position, score_value) VALUES
        (v_q5, 'oui', 'Oui', 1, 1),
        (v_q5, 'non', 'Non', 2, 0);

    -- Question d'ouverture, HORS score
    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, is_scored)
    VALUES (v_ver, 'wants_to_talk', 6,
            'Souhaitez-vous en parler avec votre nutritionniste ?',
            'single_choice', false, false)
    RETURNING id INTO v_q6;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_q6, 'oui', 'Oui', 1),
        (v_q6, 'non', 'Non', 2);

    -- Règle de score : >=2 "oui" parmi les questions is_scored => dépistage positif
    -- is_patient_visible = false : verrou structurel.
    INSERT INTO questionnaire_template_scoring_rules
        (template_version_id, method, match_value, threshold, is_patient_visible)
    VALUES (v_ver, 'count_matching', 'oui', 2, false);
END $seed$;

-- ----- T8. Symptômes digestifs --------------------------------------
DO $seed$
DECLARE
    v_tmpl    UUID;
    v_ver     UUID;
    v_bloat   UUID;
    v_stool_f UUID;
    v_reflux  UUID;
    v_alarm   UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM questionnaire_templates WHERE key = 'digestive_symptoms') THEN RETURN; END IF;

    INSERT INTO questionnaire_templates
        (key, category, title, description, dispatch_mode, estimated_minutes, is_system)
    VALUES
        ('digestive_symptoms', 'deep_dive',
         'Symptômes digestifs',
         'Pour patients IBS, intolérances suspectées, suivi post-éviction.',
         'manual_only', 3, true)
    RETURNING id INTO v_tmpl;

    INSERT INTO questionnaire_template_versions (template_id, version, is_published, published_at, notes)
    VALUES (v_tmpl, 1, true, now(), 'Version initiale')
    RETURNING id INTO v_ver;

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'bloating_frequency', 1,
            'Fréquence des ballonnements cette semaine',
            'single_choice', true)
    RETURNING id INTO v_bloat;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_bloat, 'never',      'Jamais',                1),
        (v_bloat, '1_2',        '1 - 2 fois',            2),
        (v_bloat, '3_4',        '3 - 4 fois',            3),
        (v_bloat, 'daily',      'Quotidien',             4),
        (v_bloat, 'multi_daily','Plusieurs fois / jour', 5);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, scale_min, scale_max, scale_min_label, scale_max_label)
    VALUES (v_ver, 'bloating_intensity', 2,
            'Intensité moyenne des ballonnements',
            'scale', false, 0, 10, 'aucun', 'très intense');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, help_text)
    VALUES (v_ver, 'bristol_type', 3,
            'Type de selles le plus fréquent cette semaine',
            'bristol', true,
            'Échelle de Bristol (1 = selles très dures · 7 = liquides). Affiche les illustrations standard.');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'stool_frequency', 4,
            'Fréquence des selles',
            'single_choice', false)
    RETURNING id INTO v_stool_f;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_stool_f, 'lt_1',     '< 1 / jour',  1),
        (v_stool_f, '1_2',      '1 - 2 / jour', 2),
        (v_stool_f, 'gte_3',    '3+ / jour',   3),
        (v_stool_f, 'variable', 'Variable',    4);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'food_triggers', 5,
            'Avez-vous identifié des aliments déclencheurs cette semaine ?',
            'free_text', false);

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, scale_min, scale_max, scale_min_label, scale_max_label)
    VALUES (v_ver, 'abdominal_pain', 6,
            'Douleurs abdominales (intensité moyenne)',
            'scale', false, 0, 10, 'aucune', 'très fortes');

    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required)
    VALUES (v_ver, 'reflux_frequency', 7,
            'Reflux ou brûlures cette semaine',
            'single_choice', false)
    RETURNING id INTO v_reflux;
    INSERT INTO questionnaire_question_options (question_id, value, label, position) VALUES
        (v_reflux, 'never',     'Jamais',     1),
        (v_reflux, 'rarely',    'Rarement',   2),
        (v_reflux, 'sometimes', 'Parfois',    3),
        (v_reflux, 'often',     'Souvent',    4),
        (v_reflux, 'daily',     'Quotidien',  5);

    -- Drapeaux rouges : sang dans les selles, perte de poids involontaire, etc.
    -- Tout item coché (sauf "Aucun") doit déclencher orientation médicale (P3).
    INSERT INTO questionnaire_questions
        (template_version_id, key, position, label, type, is_required, help_text)
    VALUES (v_ver, 'alarm_signs', 8,
            'Signes d''alarme — avez-vous remarqué l''un de ces éléments ?',
            'multi_choice', true,
            'Cochez tous les éléments qui s''appliquent. "Aucun" si rien.')
    RETURNING id INTO v_alarm;
    INSERT INTO questionnaire_question_options (question_id, value, label, position, is_exclusive) VALUES
        (v_alarm, 'blood',          'Sang dans les selles',              1, false),
        (v_alarm, 'weight_loss',    'Perte de poids involontaire',       2, false),
        (v_alarm, 'fever',          'Fièvre',                            3, false),
        (v_alarm, 'swallow',        'Difficulté à avaler',               4, false),
        (v_alarm, 'night_pain',     'Douleur qui réveille la nuit',      5, false),
        (v_alarm, 'none',           'Aucun de ces signes',               6, true);
END $seed$;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Vérification rapide post-déploiement :
--   SELECT key, category, dispatch_mode, active
--   FROM questionnaire_templates ORDER BY category, key;
-- Doit retourner 8 lignes (7 actives + scoff_screening inactive).
-- =====================================================
