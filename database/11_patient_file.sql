-- ============================================================================
-- NutriSensia Database Schema - 11 Patient File (Dossier)
-- ============================================================================
-- Phase 9: Dossier Patient
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql, 06_appointments.sql
-- User Stories: FILE-001 à FILE-007
-- ============================================================================

-- ============================================================================
-- DROP EXISTING TABLES (pour recréation propre)
-- Note: Supprime les données existantes. À utiliser en développement uniquement.
-- ============================================================================

DROP TABLE IF EXISTS change_reports CASCADE;
DROP TABLE IF EXISTS objective_progress_logs CASCADE;
DROP TABLE IF EXISTS patient_objectives CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS follow_up_questionnaires CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS anamnesis_sections CASCADE;
DROP TABLE IF EXISTS anamneses CASCADE;

-- ============================================================================
-- TABLE: anamneses
-- Description: Questionnaires d'anamnèse des patients
-- User Story: FILE-001
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamneses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Patient
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Nutritionniste qui a créé l'anamnèse
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Version (permet les mises à jour)
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,

    -- Statut
    status questionnaire_status DEFAULT 'pending',
    completed_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte: un seul anamnèse courant par patient
    UNIQUE(patient_id, is_current) -- Note: nécessite une gestion spéciale car is_current peut être false
);

-- Trigger pour updated_at
CREATE TRIGGER anamneses_updated_at
    BEFORE UPDATE ON anamneses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_anamneses_patient ON anamneses(patient_id);
CREATE INDEX idx_anamneses_current ON anamneses(patient_id, is_current) WHERE is_current = true;

-- ============================================================================
-- TABLE: anamnesis_sections
-- Description: Sections de l'anamnèse avec données structurées
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Anamnèse parente
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Section
    section_id VARCHAR(50) NOT NULL, -- 'identite', 'morphologie', 'historique', 'sante', 'habitudes', 'lifestyle', 'motivation'
    section_label VARCHAR(100) NOT NULL,
    section_icon VARCHAR(10),

    -- Données (structure JSON flexible)
    fields JSONB NOT NULL DEFAULT '[]', -- [{ label: string, value: string, type?: string }]

    -- Ordre d'affichage
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(anamnesis_id, section_id)
);

-- Trigger pour updated_at
CREATE TRIGGER anamnesis_sections_updated_at
    BEFORE UPDATE ON anamnesis_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_anamnesis_sections_anamnesis ON anamnesis_sections(anamnesis_id);

-- ============================================================================
-- TABLE: consultations
-- Description: Consultations effectuées avec résumé
-- User Story: FILE-005
-- Note: Créée avant follow_up_questionnaires car cette dernière la référence
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

    -- Date et durée
    date DATE NOT NULL,
    start_time TIME,
    duration_minutes INTEGER,

    -- Type et mode
    consultation_type VARCHAR(50), -- 'Suivi', 'Bilan', 'Approfondi', etc.
    mode consultation_mode NOT NULL DEFAULT 'cabinet',

    -- Contenu
    summary TEXT,
    key_points TEXT[], -- Points clés de la consultation
    next_steps TEXT, -- Prochaines étapes

    -- Notes privées (visibles uniquement par le nutritionniste)
    private_notes TEXT,

    -- Documents associés
    attached_document_ids UUID[],

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_consultations_patient ON consultations(patient_id, date DESC);
CREATE INDEX idx_consultations_nutritionist ON consultations(nutritionist_id, date DESC);
CREATE INDEX idx_consultations_appointment ON consultations(appointment_id);
CREATE INDEX idx_consultations_date ON consultations(date DESC);

-- ============================================================================
-- TABLE: follow_up_questionnaires
-- Description: Questionnaires de suivi périodiques
-- User Story: FILE-003
-- ============================================================================

CREATE TABLE IF NOT EXISTS follow_up_questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Patient
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Type de questionnaire
    questionnaire_type VARCHAR(30) NOT NULL DEFAULT 'suivi', -- 'suivi', 'feedback', 'custom'

    -- Titre
    title VARCHAR(200) NOT NULL,

    -- Lié à une consultation
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,

    -- Statut
    status questionnaire_status DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMPTZ,

    -- Réponses (structure JSON)
    questions JSONB NOT NULL DEFAULT '[]', -- [{ id, question, type, options?, required }]
    answers JSONB, -- [{ question_id, answer }]

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER follow_up_questionnaires_updated_at
    BEFORE UPDATE ON follow_up_questionnaires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_follow_up_questionnaires_patient ON follow_up_questionnaires(patient_id);
CREATE INDEX idx_follow_up_questionnaires_status ON follow_up_questionnaires(status);
CREATE INDEX idx_follow_up_questionnaires_due ON follow_up_questionnaires(due_date) WHERE status = 'pending';
CREATE INDEX idx_follow_up_questionnaires_consultation ON follow_up_questionnaires(consultation_id);

-- ============================================================================
-- TABLE: documents
-- Description: Documents uploadés (analyses, plans, ressources)
-- User Story: FILE-004
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Propriétaire et uploadeur
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    uploader_type VARCHAR(20) NOT NULL, -- 'patient', 'nutritionist'

    -- Fichier
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- 'pdf', 'image', 'doc', etc.
    mime_type VARCHAR(100),
    file_url TEXT NOT NULL,
    file_size INTEGER, -- en bytes

    -- Catégorie
    category VARCHAR(50) NOT NULL DEFAULT 'Autre', -- 'Analyses', 'Plans', 'Ressources', 'Autre'

    -- Description
    description TEXT,

    -- Métadonnées du fichier
    thumbnail_url TEXT,
    page_count INTEGER, -- pour PDFs

    -- Lié à une consultation
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Trigger pour updated_at
CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_documents_uploader ON documents(uploaded_by);
CREATE INDEX idx_documents_category ON documents(patient_id, category);
CREATE INDEX idx_documents_consultation ON documents(consultation_id);
CREATE INDEX idx_documents_active ON documents(patient_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE: patient_objectives
-- Description: Objectifs du patient définis avec le nutritionniste
-- User Story: FILE-006
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Patient et nutritionniste
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nutritionniste

    -- Objectif
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'Poids', 'Habitude', 'Comportement', 'Nutrition', 'Activité'

    -- Valeurs cibles
    target_value VARCHAR(100),
    target_unit VARCHAR(30),
    current_value VARCHAR(100),
    start_value VARCHAR(100),

    -- Progression (0-100)
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

    -- Dates
    start_date DATE DEFAULT CURRENT_DATE,
    deadline DATE,

    -- Statut
    status objective_status DEFAULT 'in_progress', -- 'not_started', 'in_progress', 'on_track', 'at_risk', 'completed', 'abandoned'

    -- Priorité
    priority INTEGER DEFAULT 1, -- 1 = haute, 2 = moyenne, 3 = basse

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Trigger pour updated_at
CREATE TRIGGER patient_objectives_updated_at
    BEFORE UPDATE ON patient_objectives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_patient_objectives_patient ON patient_objectives(patient_id);
CREATE INDEX idx_patient_objectives_status ON patient_objectives(patient_id, status);
CREATE INDEX idx_patient_objectives_category ON patient_objectives(patient_id, category);
CREATE INDEX idx_patient_objectives_active ON patient_objectives(patient_id)
    WHERE status NOT IN ('completed'::objective_status, 'abandoned'::objective_status);

-- ============================================================================
-- TABLE: objective_progress_logs
-- Description: Historique de progression des objectifs
-- ============================================================================

CREATE TABLE IF NOT EXISTS objective_progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Objectif
    objective_id UUID NOT NULL REFERENCES patient_objectives(id) ON DELETE CASCADE,

    -- Progression
    progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
    value VARCHAR(100),
    notes TEXT,

    -- Qui a mis à jour
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_objective_progress_logs_objective ON objective_progress_logs(objective_id, created_at DESC);

-- ============================================================================
-- TABLE: change_reports
-- Description: Signalements de changement par le patient
-- User Story: FILE-002
-- ============================================================================

CREATE TABLE IF NOT EXISTS change_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Patient
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Section de l'anamnèse concernée
    anamnesis_section_id VARCHAR(50) NOT NULL,

    -- Changement signalé
    change_type VARCHAR(50) NOT NULL, -- 'health', 'medication', 'allergy', 'lifestyle', 'other'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    -- Ancienne et nouvelle valeur (si applicable)
    old_value TEXT,
    new_value TEXT,

    -- Statut de traitement
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'integrated'
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_change_reports_patient ON change_reports(patient_id);
CREATE INDEX idx_change_reports_status ON change_reports(status);
CREATE INDEX idx_change_reports_pending ON change_reports(patient_id, status) WHERE status = 'pending';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour créer une nouvelle version de l'anamnèse
CREATE OR REPLACE FUNCTION create_anamnesis_version(
    p_patient_id UUID,
    p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_current_version INTEGER;
    v_new_anamnesis_id UUID;
BEGIN
    -- Récupérer la version actuelle
    SELECT COALESCE(MAX(version), 0) INTO v_current_version
    FROM anamneses
    WHERE patient_id = p_patient_id;

    -- Marquer l'ancienne comme non courante
    UPDATE anamneses
    SET is_current = false, updated_at = now()
    WHERE patient_id = p_patient_id AND is_current = true;

    -- Créer la nouvelle version
    INSERT INTO anamneses (patient_id, created_by, version, is_current, status)
    VALUES (p_patient_id, p_created_by, v_current_version + 1, true, 'pending')
    RETURNING id INTO v_new_anamnesis_id;

    RETURN v_new_anamnesis_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir l'anamnèse courante d'un patient
CREATE OR REPLACE FUNCTION get_current_anamnesis(p_patient_id UUID)
RETURNS TABLE (
    anamnesis_id UUID,
    version INTEGER,
    status questionnaire_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    sections JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id AS anamnesis_id,
        a.version,
        a.status,
        a.created_at,
        a.updated_at,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', s.section_id,
                    'label', s.section_label,
                    'icon', s.section_icon,
                    'fields', s.fields,
                    'order', s.display_order
                ) ORDER BY s.display_order
            )
            FROM anamnesis_sections s
            WHERE s.anamnesis_id = a.id),
            '[]'::JSONB
        ) AS sections
    FROM anamneses a
    WHERE a.patient_id = p_patient_id
        AND a.is_current = true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le dossier complet d'un patient
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
        (SELECT COUNT(*)::INTEGER FROM follow_up_questionnaires WHERE patient_id = p_patient_id AND status = 'pending') AS pending_questionnaires,
        (SELECT COUNT(*)::INTEGER FROM follow_up_questionnaires WHERE patient_id = p_patient_id AND status = 'completed') AS completed_questionnaires,
        (SELECT COUNT(*)::INTEGER FROM documents WHERE patient_id = p_patient_id AND deleted_at IS NULL) AS total_documents,
        (SELECT COUNT(*)::INTEGER FROM consultations WHERE patient_id = p_patient_id) AS total_consultations,
        (SELECT MAX(date) FROM consultations WHERE patient_id = p_patient_id) AS last_consultation_date,
        (SELECT COUNT(*)::INTEGER FROM patient_objectives WHERE patient_id = p_patient_id AND status NOT IN ('completed', 'abandoned')) AS active_objectives,
        (SELECT COUNT(*)::INTEGER FROM patient_objectives WHERE patient_id = p_patient_id AND status = 'on_track') AS objectives_on_track,
        (SELECT COUNT(*)::INTEGER FROM change_reports WHERE patient_id = p_patient_id AND status = 'pending') AS pending_changes;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour exporter le dossier patient (FILE-007)
CREATE OR REPLACE FUNCTION export_patient_file(p_patient_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'patient', (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = p_patient_id),
        'patient_profile', (SELECT row_to_json(pp.*) FROM patient_profiles pp WHERE pp.user_id = p_patient_id),
        'anamnesis', (SELECT sections FROM get_current_anamnesis(p_patient_id)),
        'consultations', (
            SELECT COALESCE(jsonb_agg(row_to_json(c.*) ORDER BY c.date DESC), '[]'::JSONB)
            FROM consultations c WHERE c.patient_id = p_patient_id
        ),
        'objectives', (
            SELECT COALESCE(jsonb_agg(row_to_json(o.*)), '[]'::JSONB)
            FROM patient_objectives o WHERE o.patient_id = p_patient_id
        ),
        'documents', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'id', d.id,
                'name', d.name,
                'category', d.category,
                'uploaded_at', d.created_at
            )), '[]'::JSONB)
            FROM documents d WHERE d.patient_id = p_patient_id AND d.deleted_at IS NULL
        ),
        'exported_at', now()
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_reports ENABLE ROW LEVEL SECURITY;

-- Politiques pour anamneses
DROP POLICY IF EXISTS anamneses_access ON anamneses;
CREATE POLICY anamneses_access ON anamneses
    FOR ALL USING (
        patient_id = auth.uid()
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = anamneses.patient_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour anamnesis_sections
DROP POLICY IF EXISTS anamnesis_sections_access ON anamnesis_sections;
CREATE POLICY anamnesis_sections_access ON anamnesis_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM anamneses a
            WHERE a.id = anamnesis_sections.anamnesis_id
            AND (
                a.patient_id = auth.uid()
                OR a.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM patient_profiles pp
                    WHERE pp.user_id = a.patient_id
                    AND pp.nutritionist_id = auth.uid()
                )
            )
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour follow_up_questionnaires
DROP POLICY IF EXISTS follow_up_questionnaires_access ON follow_up_questionnaires;
CREATE POLICY follow_up_questionnaires_access ON follow_up_questionnaires
    FOR ALL USING (
        patient_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = follow_up_questionnaires.patient_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour consultations
DROP POLICY IF EXISTS consultations_access ON consultations;
CREATE POLICY consultations_access ON consultations
    FOR ALL USING (
        patient_id = auth.uid()
        OR nutritionist_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour documents
DROP POLICY IF EXISTS documents_access ON documents;
CREATE POLICY documents_access ON documents
    FOR ALL USING (
        patient_id = auth.uid()
        OR uploaded_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = documents.patient_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour patient_objectives
DROP POLICY IF EXISTS patient_objectives_access ON patient_objectives;
CREATE POLICY patient_objectives_access ON patient_objectives
    FOR ALL USING (
        patient_id = auth.uid()
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = patient_objectives.patient_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour objective_progress_logs
DROP POLICY IF EXISTS objective_progress_logs_access ON objective_progress_logs;
CREATE POLICY objective_progress_logs_access ON objective_progress_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patient_objectives po
            WHERE po.id = objective_progress_logs.objective_id
            AND (
                po.patient_id = auth.uid()
                OR po.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM patient_profiles pp
                    WHERE pp.user_id = po.patient_id
                    AND pp.nutritionist_id = auth.uid()
                )
            )
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour change_reports
DROP POLICY IF EXISTS change_reports_access ON change_reports;
CREATE POLICY change_reports_access ON change_reports
    FOR ALL USING (
        patient_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = change_reports.patient_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE anamneses IS 'Questionnaires d''anamnèse des patients avec versioning (FILE-001)';
COMMENT ON TABLE anamnesis_sections IS 'Sections de l''anamnèse avec données structurées';
COMMENT ON TABLE follow_up_questionnaires IS 'Questionnaires de suivi périodiques (FILE-003)';
COMMENT ON TABLE consultations IS 'Consultations effectuées avec résumé (FILE-005)';
COMMENT ON TABLE documents IS 'Documents uploadés (analyses, plans, ressources) (FILE-004)';
COMMENT ON TABLE patient_objectives IS 'Objectifs du patient définis avec le nutritionniste (FILE-006)';
COMMENT ON TABLE objective_progress_logs IS 'Historique de progression des objectifs';
COMMENT ON TABLE change_reports IS 'Signalements de changement par le patient (FILE-002)';

COMMENT ON FUNCTION create_anamnesis_version IS 'Crée une nouvelle version de l''anamnèse';
COMMENT ON FUNCTION get_current_anamnesis IS 'Récupère l''anamnèse courante d''un patient';
COMMENT ON FUNCTION get_patient_file_summary IS 'Récupère un résumé du dossier patient';
COMMENT ON FUNCTION export_patient_file IS 'Exporte le dossier complet du patient en JSON (FILE-007)';
