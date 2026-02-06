-- ============================================================================
-- NutriSensia Database Schema - 13 Exclusive Content
-- ============================================================================
-- Phase 11: Contenu Exclusif
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql
-- User Stories: CONTENT-001 à CONTENT-008
-- ============================================================================

-- ============================================================================
-- TABLE: content_categories
-- Description: Catégories de contenu exclusif
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Affichage
    icon VARCHAR(50),
    emoji VARCHAR(10),
    color VARCHAR(20),
    description TEXT,

    -- Ordre
    display_order INTEGER DEFAULT 0,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_content_categories_slug ON content_categories(slug);
CREATE INDEX idx_content_categories_active ON content_categories(is_active) WHERE is_active = true;

-- Données initiales
INSERT INTO content_categories (slug, name_fr, name_en, emoji, display_order) VALUES
    ('nutrition-guides', 'Guides Nutrition', 'Nutrition Guides', '📚', 1),
    ('meal-prep', 'Meal Prep', 'Meal Prep', '🥗', 2),
    ('mindful-eating', 'Alimentation Consciente', 'Mindful Eating', '🧘', 3),
    ('seasonal-tips', 'Conseils Saisonniers', 'Seasonal Tips', '🌿', 4),
    ('video-tutorials', 'Tutoriels Vidéo', 'Video Tutorials', '🎥', 5),
    ('recipes-exclusive', 'Recettes Exclusives', 'Exclusive Recipes', '👨‍🍳', 6),
    ('wellness', 'Bien-être', 'Wellness', '💆', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TABLE: content_themes
-- Description: Thèmes/tags pour le contenu
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Affichage
    color VARCHAR(20),

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_content_themes_slug ON content_themes(slug);

-- Données initiales
INSERT INTO content_themes (slug, name_fr, name_en, color) VALUES
    ('weight-loss', 'Perte de poids', 'Weight Loss', '#EF4444'),
    ('muscle-gain', 'Prise de muscle', 'Muscle Gain', '#3B82F6'),
    ('energy-boost', 'Énergie', 'Energy Boost', '#F59E0B'),
    ('digestion', 'Digestion', 'Digestion', '#10B981'),
    ('sleep', 'Sommeil', 'Sleep', '#6366F1'),
    ('stress-management', 'Gestion du stress', 'Stress Management', '#8B5CF6'),
    ('immunity', 'Immunité', 'Immunity', '#EC4899'),
    ('beginners', 'Débutants', 'Beginners', '#14B8A6')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TABLE: exclusive_contents
-- Description: Contenus exclusifs (articles, vidéos, guides)
-- ============================================================================

CREATE TABLE IF NOT EXISTS exclusive_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Catégorie
    category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,

    -- Créateur
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Informations
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,

    -- Contenu
    content_type content_type NOT NULL DEFAULT 'article', -- 'article', 'video', 'guide', 'infographic', 'podcast'
    content_body TEXT, -- Contenu markdown pour articles
    video_url TEXT,
    audio_url TEXT,
    pdf_url TEXT,

    -- Médias
    thumbnail_url TEXT,
    cover_image_url TEXT,

    -- Durée (pour vidéos/podcasts)
    duration_minutes INTEGER,

    -- Tags/thèmes
    theme_ids UUID[],

    -- Audience cible
    target_conditions TEXT[], -- Ex: ['perte-de-poids', 'diabete']
    difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'

    -- Engagement
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,

    -- Premium
    is_premium BOOLEAN DEFAULT true,

    -- Publication
    status content_status DEFAULT 'draft', -- 'draft', 'published', 'archived'
    published_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Trigger pour updated_at
CREATE TRIGGER exclusive_contents_updated_at
    BEFORE UPDATE ON exclusive_contents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_exclusive_contents_category ON exclusive_contents(category_id);
CREATE INDEX idx_exclusive_contents_slug ON exclusive_contents(slug);
CREATE INDEX idx_exclusive_contents_type ON exclusive_contents(content_type);
CREATE INDEX idx_exclusive_contents_status ON exclusive_contents(status);
CREATE INDEX idx_exclusive_contents_published ON exclusive_contents(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_exclusive_contents_creator ON exclusive_contents(created_by);
CREATE INDEX idx_exclusive_contents_search ON exclusive_contents
    USING gin(to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- TABLE: content_theme_assignments
-- Description: Association contenu-thèmes
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_theme_assignments (
    content_id UUID REFERENCES exclusive_contents(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES content_themes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (content_id, theme_id)
);

-- Index
CREATE INDEX idx_content_theme_assignments_content ON content_theme_assignments(content_id);
CREATE INDEX idx_content_theme_assignments_theme ON content_theme_assignments(theme_id);

-- ============================================================================
-- TABLE: content_saves
-- Description: Contenus sauvegardés par les utilisateurs
-- User Story: CONTENT-004
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES exclusive_contents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(user_id, content_id)
);

-- Index
CREATE INDEX idx_content_saves_user ON content_saves(user_id, created_at DESC);
CREATE INDEX idx_content_saves_content ON content_saves(content_id);

-- ============================================================================
-- TABLE: content_views
-- Description: Historique de visualisation
-- User Story: CONTENT-002
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES exclusive_contents(id) ON DELETE CASCADE,

    -- Progression (pour vidéos/guides)
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,

    -- Metadata
    first_viewed_at TIMESTAMPTZ DEFAULT now(),
    last_viewed_at TIMESTAMPTZ DEFAULT now(),
    view_count INTEGER DEFAULT 1,

    -- Contrainte d'unicité
    UNIQUE(user_id, content_id)
);

-- Index
CREATE INDEX idx_content_views_user ON content_views(user_id, last_viewed_at DESC);
CREATE INDEX idx_content_views_content ON content_views(content_id);
CREATE INDEX idx_content_views_completed ON content_views(user_id, completed) WHERE completed = true;

-- ============================================================================
-- TABLE: learning_paths
-- Description: Parcours d'apprentissage structurés
-- User Story: CONTENT-006
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Créateur
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Informations
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,

    -- Médias
    thumbnail_url TEXT,
    cover_image_url TEXT,

    -- Durée estimée
    estimated_hours DECIMAL(4, 1),

    -- Difficulté
    difficulty_level VARCHAR(20) DEFAULT 'beginner',

    -- Thèmes
    theme_ids UUID[],

    -- Stats
    enrolled_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5, 2) DEFAULT 0,

    -- Publication
    status content_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX idx_learning_paths_status ON learning_paths(status);
CREATE INDEX idx_learning_paths_published ON learning_paths(published_at DESC) WHERE status = 'published';

-- ============================================================================
-- TABLE: learning_path_modules
-- Description: Modules des parcours d'apprentissage
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_path_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parcours parent
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,

    -- Contenu associé
    content_id UUID REFERENCES exclusive_contents(id) ON DELETE SET NULL,

    -- Ou contenu personnalisé
    title VARCHAR(200),
    description TEXT,
    content_body TEXT,

    -- Position
    module_number INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,

    -- Durée estimée (minutes)
    estimated_minutes INTEGER,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(learning_path_id, module_number)
);

-- Index
CREATE INDEX idx_learning_path_modules_path ON learning_path_modules(learning_path_id, module_number);

-- ============================================================================
-- TABLE: learning_progress
-- Description: Progression dans les parcours
-- User Story: CONTENT-007
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur et parcours
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,

    -- Progression
    current_module_id UUID REFERENCES learning_path_modules(id) ON DELETE SET NULL,
    completed_modules INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),

    -- Statut
    started_at TIMESTAMPTZ DEFAULT now(),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,

    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(user_id, learning_path_id)
);

-- Trigger pour updated_at
CREATE TRIGGER learning_progress_updated_at
    BEFORE UPDATE ON learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_path ON learning_progress(learning_path_id);
CREATE INDEX idx_learning_progress_active ON learning_progress(user_id, completed) WHERE completed = false;

-- ============================================================================
-- TABLE: learning_module_completions
-- Description: Modules complétés par l'utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_module_completions (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES learning_path_modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, module_id)
);

-- Index
CREATE INDEX idx_learning_module_completions_user ON learning_module_completions(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_content_view(
    p_user_id UUID,
    p_content_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Insérer ou mettre à jour la vue
    INSERT INTO content_views (user_id, content_id)
    VALUES (p_user_id, p_content_id)
    ON CONFLICT (user_id, content_id) DO UPDATE SET
        last_viewed_at = now(),
        view_count = content_views.view_count + 1;

    -- Incrémenter le compteur global
    UPDATE exclusive_contents
    SET view_count = view_count + 1, updated_at = now()
    WHERE id = p_content_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour la progression d'un parcours
CREATE OR REPLACE FUNCTION update_learning_progress(
    p_user_id UUID,
    p_module_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_path_id UUID;
    v_total INTEGER;
    v_completed INTEGER;
BEGIN
    -- Récupérer le parcours
    SELECT learning_path_id INTO v_path_id
    FROM learning_path_modules
    WHERE id = p_module_id;

    IF v_path_id IS NULL THEN
        RETURN;
    END IF;

    -- Marquer le module comme complété
    INSERT INTO learning_module_completions (user_id, module_id)
    VALUES (p_user_id, p_module_id)
    ON CONFLICT DO NOTHING;

    -- Compter les modules
    SELECT COUNT(*) INTO v_total
    FROM learning_path_modules
    WHERE learning_path_id = v_path_id;

    SELECT COUNT(*) INTO v_completed
    FROM learning_module_completions lmc
    JOIN learning_path_modules lpm ON lpm.id = lmc.module_id
    WHERE lpm.learning_path_id = v_path_id
    AND lmc.user_id = p_user_id;

    -- Mettre à jour la progression
    INSERT INTO learning_progress (
        user_id, learning_path_id, current_module_id,
        completed_modules, total_modules, progress_percent,
        completed, completed_at
    ) VALUES (
        p_user_id, v_path_id, p_module_id,
        v_completed, v_total,
        ROUND((v_completed::DECIMAL / v_total * 100))::INTEGER,
        v_completed = v_total,
        CASE WHEN v_completed = v_total THEN now() ELSE NULL END
    )
    ON CONFLICT (user_id, learning_path_id) DO UPDATE SET
        current_module_id = p_module_id,
        completed_modules = v_completed,
        total_modules = v_total,
        progress_percent = ROUND((v_completed::DECIMAL / v_total * 100))::INTEGER,
        completed = (v_completed = v_total),
        completed_at = CASE WHEN v_completed = v_total THEN now() ELSE learning_progress.completed_at END,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le contenu recommandé
CREATE OR REPLACE FUNCTION get_recommended_content(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    content_id UUID,
    title VARCHAR,
    content_type content_type,
    thumbnail_url TEXT,
    reason TEXT
) AS $$
BEGIN
    -- Pour l'instant, retourne le contenu populaire non vu
    -- TODO: Implémenter la recommandation basée sur le profil
    RETURN QUERY
    SELECT
        ec.id AS content_id,
        ec.title,
        ec.content_type,
        ec.thumbnail_url,
        'Populaire'::TEXT AS reason
    FROM exclusive_contents ec
    WHERE ec.status = 'published'
        AND ec.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM content_views cv
            WHERE cv.content_id = ec.id AND cv.user_id = p_user_id
        )
    ORDER BY ec.view_count DESC, ec.published_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exclusive_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_theme_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_module_completions ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique pour catégories et thèmes
DROP POLICY IF EXISTS content_categories_read ON content_categories;
CREATE POLICY content_categories_read ON content_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS content_themes_read ON content_themes;
CREATE POLICY content_themes_read ON content_themes
    FOR SELECT USING (is_active = true);

-- Politiques pour exclusive_contents
DROP POLICY IF EXISTS exclusive_contents_published ON exclusive_contents;
CREATE POLICY exclusive_contents_published ON exclusive_contents
    FOR SELECT USING (
        status = 'published' AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS exclusive_contents_own ON exclusive_contents;
CREATE POLICY exclusive_contents_own ON exclusive_contents
    FOR ALL USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour content_theme_assignments
DROP POLICY IF EXISTS content_theme_assignments_read ON content_theme_assignments;
CREATE POLICY content_theme_assignments_read ON content_theme_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exclusive_contents ec
            WHERE ec.id = content_theme_assignments.content_id
            AND ec.status = 'published'
        )
    );

-- Politiques pour content_saves et content_views
DROP POLICY IF EXISTS content_saves_own ON content_saves;
CREATE POLICY content_saves_own ON content_saves
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS content_views_own ON content_views;
CREATE POLICY content_views_own ON content_views
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour learning_paths
DROP POLICY IF EXISTS learning_paths_published ON learning_paths;
CREATE POLICY learning_paths_published ON learning_paths
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS learning_paths_manage ON learning_paths;
CREATE POLICY learning_paths_manage ON learning_paths
    FOR ALL USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour learning_path_modules
DROP POLICY IF EXISTS learning_path_modules_read ON learning_path_modules;
CREATE POLICY learning_path_modules_read ON learning_path_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM learning_paths lp
            WHERE lp.id = learning_path_modules.learning_path_id
            AND lp.status = 'published'
        )
    );

-- Politiques pour learning_progress et completions
DROP POLICY IF EXISTS learning_progress_own ON learning_progress;
CREATE POLICY learning_progress_own ON learning_progress
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS learning_module_completions_own ON learning_module_completions;
CREATE POLICY learning_module_completions_own ON learning_module_completions
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE content_categories IS 'Catégories de contenu exclusif';
COMMENT ON TABLE content_themes IS 'Thèmes/tags pour le contenu';
COMMENT ON TABLE exclusive_contents IS 'Contenus exclusifs (articles, vidéos, guides)';
COMMENT ON TABLE content_saves IS 'Contenus sauvegardés par les utilisateurs (CONTENT-004)';
COMMENT ON TABLE content_views IS 'Historique de visualisation (CONTENT-002)';
COMMENT ON TABLE learning_paths IS 'Parcours d''apprentissage structurés (CONTENT-006)';
COMMENT ON TABLE learning_path_modules IS 'Modules des parcours d''apprentissage';
COMMENT ON TABLE learning_progress IS 'Progression dans les parcours (CONTENT-007)';
