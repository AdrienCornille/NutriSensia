-- ============================================================================
-- NutriSensia Database Schema - 19 Anamnesis Structured
-- ============================================================================
-- Migration: JSONB non-typé → tables normalisées par section
-- Dépendances: 11_patient_file.sql (table anamneses)
-- Note: L'ancienne table anamnesis_sections est CONSERVÉE pour rétro-compatibilité.
--       Les nouvelles tables coexistent et seront utilisées par les API v2.
-- ============================================================================

-- ============================================================================
-- TABLE: anamnesis_identite
-- Section 1 : Identité & Coordonnées (17 champs + 7 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_identite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Identité
    prenom TEXT,
    nom TEXT,
    date_naissance DATE,
    genre TEXT,                           -- 'Homme', 'Femme', 'Non-binaire', etc.
    genre_note TEXT,

    -- Contact
    email TEXT,
    telephone TEXT,                       -- Format: +41 079 123 45 67

    -- Adresse
    rue TEXT,
    numero TEXT,
    code_postal TEXT,
    ville TEXT,
    pays TEXT,                            -- 'Suisse', 'France', etc.

    -- Situation
    situation_familiale TEXT,             -- 'Célibataire', 'En couple', 'Marié(e)', etc.
    situation_familiale_note TEXT,
    profession TEXT,
    profession_note TEXT,
    nombre_enfants INTEGER CHECK (nombre_enfants >= 0 AND nombre_enfants <= 20),
    nombre_enfants_note TEXT,

    -- Médical
    medecin_traitant TEXT,
    medecin_traitant_note TEXT,
    motif_adressage TEXT,                 -- 'Initiative personnelle', 'Médecin traitant', etc.
    motif_adressage_note TEXT,
    raison_consultation TEXT[],           -- multiselect: ['Perte de poids', 'Troubles digestifs', ...]
    raison_consultation_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_identite_updated_at
    BEFORE UPDATE ON anamnesis_identite
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_identite_anamnesis ON anamnesis_identite(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_morphologie
-- Section 2 : Données morphologiques (10 champs + 4 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_morphologie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Taille et poids
    taille NUMERIC CHECK (taille >= 100 AND taille <= 250),              -- cm
    poids_initial NUMERIC CHECK (poids_initial >= 20 AND poids_initial <= 300),  -- kg
    poids_initial_note TEXT,
    poids_ideal NUMERIC CHECK (poids_ideal >= 20 AND poids_ideal <= 200),        -- kg
    poids_ideal_note TEXT,

    -- Tours
    tour_taille NUMERIC CHECK (tour_taille >= 40 AND tour_taille <= 200),  -- cm
    tour_hanches NUMERIC CHECK (tour_hanches >= 40 AND tour_hanches <= 200), -- cm
    tour_poignet NUMERIC CHECK (tour_poignet >= 10 AND tour_poignet <= 30),  -- cm
    tour_bras NUMERIC CHECK (tour_bras >= 15 AND tour_bras <= 60),           -- cm

    -- Composition corporelle
    masse_grasse NUMERIC CHECK (masse_grasse >= 3 AND masse_grasse <= 60),       -- %
    masse_grasse_note TEXT,
    masse_musculaire NUMERIC CHECK (masse_musculaire >= 10 AND masse_musculaire <= 60), -- %
    masse_musculaire_note TEXT,
    masse_hydrique NUMERIC CHECK (masse_hydrique >= 30 AND masse_hydrique <= 80),       -- %

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_morphologie_updated_at
    BEFORE UPDATE ON anamnesis_morphologie
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_morphologie_anamnesis ON anamnesis_morphologie(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_historique
-- Section 3 : Historique pondéral (9 champs + 8 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_historique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Poids historiques
    poids_minimum NUMERIC CHECK (poids_minimum >= 20 AND poids_minimum <= 300),  -- kg
    poids_minimum_note TEXT,
    poids_maximum NUMERIC CHECK (poids_maximum >= 20 AND poids_maximum <= 300),  -- kg
    poids_maximum_note TEXT,
    poids_forme NUMERIC CHECK (poids_forme >= 20 AND poids_forme <= 300),        -- kg (souhaité par le patient)
    poids_forme_note TEXT,

    -- Début des problèmes
    age_debut_problemes INTEGER CHECK (age_debut_problemes >= 0 AND age_debut_problemes <= 100),
    age_debut_problemes_note TEXT,

    -- Effet yo-yo
    effet_yoyo BOOLEAN,
    evenements_declencheurs TEXT[],       -- multiselect conditionnel (si effet_yoyo = true)
    evenements_declencheurs_note TEXT,

    -- Historique régimes
    regimes_passes TEXT[],                -- multiselect: ['Keto', 'Jeûne intermittent', ...]
    regimes_passes_note TEXT,
    fluctuations TEXT[],                  -- multiselect: ['Prise progressive', 'Yo-yo fréquent', ...]
    fluctuations_note TEXT,

    -- Chirurgie
    chirurgie_bariatrique TEXT,           -- 'Non', 'Sleeve', 'Bypass', etc.
    chirurgie_bariatrique_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_historique_updated_at
    BEFORE UPDATE ON anamnesis_historique
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_historique_anamnesis ON anamnesis_historique(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_sante
-- Section 4 : État de santé (10 champs + 10 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_sante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Pathologies et allergies
    pathologies TEXT[],                   -- multiselect: ['Diabète type 2', 'Hypertension', ...]
    pathologies_note TEXT,
    allergies TEXT[],                     -- multiselect: ['Gluten', 'Arachides', ...]
    allergies_note TEXT,
    intolerances TEXT[],                  -- multiselect: ['Lactose', 'Fructose', ...]
    intolerances_note TEXT,

    -- Médicaments et compléments (repeaters: [{name, dosage, frequency}])
    medicaments JSONB DEFAULT '[]',       -- [{name: "Metformine", dosage: "500mg", frequency: "2x/jour"}]
    medicaments_note TEXT,
    complements JSONB DEFAULT '[]',       -- [{name: "Vitamine D", dosage: "1000 UI", frequency: "1x/jour"}]
    complements_note TEXT,

    -- Antécédents
    antecedents_familiaux TEXT[],         -- multiselect: ['Diabète', 'Obésité', ...]
    antecedents_familiaux_note TEXT,

    -- Hormonal / Reproduction
    grossesse_allaitement TEXT,           -- 'Non concerné(e)', 'Enceinte', etc.
    grossesse_allaitement_note TEXT,
    statut_hormonal TEXT,                 -- 'Ménopause', 'Sous traitement hormonal', etc.
    statut_hormonal_note TEXT,

    -- TCA et chirurgie
    tca TEXT[],                           -- multiselect: ['Hyperphagie', 'Boulimie', ...]
    tca_note TEXT,
    operations TEXT[],                    -- multiselect: ['Cholécystectomie', 'Appendicectomie', ...]
    operations_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_sante_updated_at
    BEFORE UPDATE ON anamnesis_sante
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_sante_anamnesis ON anamnesis_sante(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_sante_bilan
-- Section 4b : Bilan digestif & biologique (16 champs + 2 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_sante_bilan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Digestif
    transit_intestinal TEXT,              -- 'Normal', 'Constipation', 'Diarrhées', 'Alternance'
    transit_intestinal_note TEXT,
    frequence_selles TEXT,                -- 'Plusieurs fois/jour', '1 fois/jour', etc.
    troubles_digestifs TEXT[],            -- multiselect: ['Ballonnements', 'Reflux', ...]
    troubles_digestifs_note TEXT,

    -- Bilan sanguin
    bilan_sanguin_disponible BOOLEAN,
    date_dernier_bilan DATE,

    -- Valeurs biologiques (conditionnelles: si bilan_sanguin_disponible = true)
    glycemie_jeun NUMERIC CHECK (glycemie_jeun >= 0.4 AND glycemie_jeun <= 4),        -- g/L
    hba1c NUMERIC CHECK (hba1c >= 3 AND hba1c <= 15),                                  -- %
    cholesterol_total NUMERIC CHECK (cholesterol_total >= 0.5 AND cholesterol_total <= 5), -- g/L
    hdl NUMERIC CHECK (hdl >= 0.1 AND hdl <= 3),                                        -- g/L
    ldl NUMERIC CHECK (ldl >= 0.1 AND ldl <= 4),                                        -- g/L
    triglycerides NUMERIC CHECK (triglycerides >= 0.1 AND triglycerides <= 10),          -- g/L
    tsh NUMERIC CHECK (tsh >= 0 AND tsh <= 50),                                         -- mUI/L
    ferritine NUMERIC CHECK (ferritine >= 0 AND ferritine <= 1000),                     -- µg/L
    vitamine_d NUMERIC CHECK (vitamine_d >= 0 AND vitamine_d <= 150),                   -- ng/mL
    vitamine_b12 NUMERIC CHECK (vitamine_b12 >= 0 AND vitamine_b12 <= 2000),            -- pg/mL
    creatinine NUMERIC CHECK (creatinine >= 0 AND creatinine <= 30),                    -- mg/L

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_sante_bilan_updated_at
    BEFORE UPDATE ON anamnesis_sante_bilan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_sante_bilan_anamnesis ON anamnesis_sante_bilan(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_habitudes
-- Section 5 : Habitudes alimentaires (13 champs + 8 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_habitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Régime
    regime_actuel TEXT,                   -- 'Omnivore', 'Végétarien', etc.
    regime_actuel_note TEXT,
    nb_repas_jour INTEGER CHECK (nb_repas_jour >= 1 AND nb_repas_jour <= 8),

    -- Repas types (textareas)
    petit_dejeuner_type TEXT,
    dejeuner_type TEXT,
    diner_type TEXT,
    collations TEXT,

    -- Préparation et lieu
    qui_prepare TEXT[],                   -- multiselect: ['Le patient', 'Conjoint', ...]
    qui_prepare_note TEXT,
    lieu_repas TEXT[],                    -- multiselect: ['Domicile', 'Bureau', ...]
    lieu_repas_note TEXT,

    -- Habitudes à table
    duree_repas TEXT,                     -- '< 10 min', '10-20 min', etc.
    duree_repas_note TEXT,
    ecran_repas TEXT,                     -- 'Jamais', 'Parfois', 'Souvent', 'Toujours'
    ecran_repas_note TEXT,

    -- Préférences
    aliments_detestes TEXT[],             -- multiselect: ['Poisson', 'Abats', ...]
    aliments_detestes_note TEXT,
    aliments_preferes TEXT[],             -- multiselect: ['Poulet', 'Pâtes', ...]
    aliments_preferes_note TEXT,

    -- Budget
    budget_alimentation TEXT,             -- 'Serré', 'Modéré', 'Confortable'
    budget_alimentation_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_habitudes_updated_at
    BEFORE UPDATE ON anamnesis_habitudes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_habitudes_anamnesis ON anamnesis_habitudes(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_consommation
-- Section 5b : Consommation & Boissons (6 champs + 6 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_consommation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Grignotage et compulsions
    grignotage TEXT,                      -- 'Jamais', 'Rarement', ..., 'Très souvent'
    grignotage_note TEXT,
    compulsions TEXT[],                   -- multiselect: ['Sucré', 'Salé', 'Chocolat', ...]
    compulsions_note TEXT,

    -- Boissons (repeaters: [{name, quantity, frequency}])
    alcool JSONB DEFAULT '[]',            -- [{name: "Vin rouge", quantity: "2 verres", frequency: "Weekend"}]
    alcool_note TEXT,
    sodas JSONB DEFAULT '[]',             -- [{name: "Coca", quantity: "33cl", frequency: "Quotidien"}]
    sodas_note TEXT,
    cafe_the JSONB DEFAULT '[]',          -- [{name: "Café", quantity: "2 tasses", frequency: "Matin"}]
    cafe_the_note TEXT,

    -- Hydratation
    hydratation TEXT,                     -- ex: '1.5' (L/jour)
    hydratation_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_consommation_updated_at
    BEFORE UPDATE ON anamnesis_consommation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_consommation_anamnesis ON anamnesis_consommation(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_lifestyle
-- Section 6 : Mode de vie (13 champs + 8 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_lifestyle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Activité professionnelle
    activite_pro TEXT,                    -- 'Sédentaire', 'Modérément actif', etc.
    activite_pro_note TEXT,
    horaires_decales BOOLEAN,
    horaires_decales_note TEXT,
    deplacements_pro TEXT,                -- 'Jamais', 'Occasionnel', 'Fréquent'
    deplacements_pro_note TEXT,

    -- Sport (repeater: [{name, duration, frequency}])
    sport JSONB DEFAULT '[]',             -- [{name: "Course", duration: "45 min", frequency: "3x/semaine"}]
    sport_note TEXT,

    -- Sommeil
    heure_lever TEXT,                     -- ex: '6h30'
    heure_coucher TEXT,                   -- ex: '22h30'
    sommeil_heures NUMERIC CHECK (sommeil_heures >= 2 AND sommeil_heures <= 14),  -- heures
    qualite_sommeil SMALLINT CHECK (qualite_sommeil >= 1 AND qualite_sommeil <= 5),
    qualite_sommeil_note TEXT,

    -- Écran
    temps_ecran TEXT,                     -- '< 2h', '2-4h', etc.

    -- Stress
    stress SMALLINT CHECK (stress >= 1 AND stress <= 5),
    stress_note TEXT,

    -- Tabac
    tabac TEXT,                           -- 'Non-fumeur', 'Ex-fumeur', 'Fumeur occasionnel', 'Fumeur quotidien'
    tabac_note TEXT,
    frequence_tabac TEXT,                 -- conditionnel: si tabac = 'Fumeur occasionnel'

    -- Social
    vie_sociale_nourriture TEXT,          -- 'Peu', 'Modérée', 'Très fréquente'
    vie_sociale_nourriture_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_lifestyle_updated_at
    BEFORE UPDATE ON anamnesis_lifestyle
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_lifestyle_anamnesis ON anamnesis_lifestyle(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_motivation
-- Section 7 : Motivation & Objectifs (11 champs + 9 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_motivation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Objectifs
    objectif_poids NUMERIC CHECK (objectif_poids >= 20 AND objectif_poids <= 300),  -- kg
    objectif_principal TEXT[],            -- multiselect: ['Perte de poids', 'Rééquilibrage', ...]
    objectif_principal_note TEXT,
    delai_souhaite TEXT,                  -- '1 mois', '3 mois', '6 mois', '1 an', 'Pas de délai'
    delai_souhaite_note TEXT,

    -- Évaluation
    stade_changement TEXT,                -- 'Pré-contemplation', 'Contemplation', ..., 'Maintien'
    stade_changement_note TEXT,
    motivation SMALLINT CHECK (motivation >= 1 AND motivation <= 10),
    motivation_note TEXT,

    -- Freins et soutien
    freins TEXT[],                        -- multiselect: ['Manque de temps', 'Stress', ...]
    freins_note TEXT,
    soutien_familial TEXT,                -- 'Fort', 'Modéré', 'Neutre', 'Faible', 'Absent'
    soutien_familial_note TEXT,

    -- Expérience
    experience_dieteticien BOOLEAN,
    experience_dieteticien_note TEXT,
    disponibilite_cuisine TEXT,           -- 'Très limitée', '15-30 min', '30-60 min', '> 1h'
    disponibilite_cuisine_note TEXT,

    -- Attentes et tentatives
    attentes_suivi TEXT,                  -- textarea
    tentatives_precedentes TEXT[],        -- multiselect: ['Aucune', 'Suivi diététicien', ...]
    tentatives_precedentes_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_motivation_updated_at
    BEFORE UPDATE ON anamnesis_motivation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_motivation_anamnesis ON anamnesis_motivation(anamnesis_id);

-- ============================================================================
-- TABLE: anamnesis_psycho
-- Section 8 : Psycho-comportemental (5 champs + 5 notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anamnesis_psycho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anamnesis_id UUID NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,

    -- Échelles (1-5)
    relation_nourriture SMALLINT CHECK (relation_nourriture >= 1 AND relation_nourriture <= 5),
    relation_nourriture_note TEXT,
    alimentation_emotionnelle SMALLINT CHECK (alimentation_emotionnelle >= 1 AND alimentation_emotionnelle <= 5),
    alimentation_emotionnelle_note TEXT,
    image_corporelle SMALLINT CHECK (image_corporelle >= 1 AND image_corporelle <= 5),
    image_corporelle_note TEXT,

    -- Comportements
    culpabilite_repas TEXT,               -- 'Jamais', 'Parfois', 'Souvent', 'Toujours'
    culpabilite_repas_note TEXT,
    rapport_balance TEXT,                 -- 'Ne se pèse jamais', 'Rarement', ..., 'Plusieurs fois/jour'
    rapport_balance_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(anamnesis_id)
);

CREATE TRIGGER anamnesis_psycho_updated_at
    BEFORE UPDATE ON anamnesis_psycho
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_anamnesis_psycho_anamnesis ON anamnesis_psycho(anamnesis_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Même pattern que anamnesis_sections : accès via la table parente anamneses

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'anamnesis_identite',
        'anamnesis_morphologie',
        'anamnesis_historique',
        'anamnesis_sante',
        'anamnesis_sante_bilan',
        'anamnesis_habitudes',
        'anamnesis_consommation',
        'anamnesis_lifestyle',
        'anamnesis_motivation',
        'anamnesis_psycho'
    ]
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

        EXECUTE format('DROP POLICY IF EXISTS %I_access ON %I', tbl, tbl);

        EXECUTE format(
            'CREATE POLICY %I_access ON %I
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM anamneses a
                        WHERE a.id = %I.anamnesis_id
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
                    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
                )',
            tbl, tbl, tbl
        );
    END LOOP;
END $$;

-- ============================================================================
-- FUNCTION: get_current_anamnesis_v2
-- Version améliorée qui lit les tables normalisées
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_anamnesis_v2(p_patient_id UUID)
RETURNS TABLE (
    anamnesis_id UUID,
    version INTEGER,
    status questionnaire_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    identite JSONB,
    morphologie JSONB,
    historique JSONB,
    sante JSONB,
    sante_bilan JSONB,
    habitudes JSONB,
    consommation JSONB,
    lifestyle JSONB,
    motivation JSONB,
    psycho JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id AS anamnesis_id,
        a.version,
        a.status,
        a.created_at,
        a.updated_at,
        (SELECT to_jsonb(i.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_identite i WHERE i.anamnesis_id = a.id) AS identite,
        (SELECT to_jsonb(m.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_morphologie m WHERE m.anamnesis_id = a.id) AS morphologie,
        (SELECT to_jsonb(h.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_historique h WHERE h.anamnesis_id = a.id) AS historique,
        (SELECT to_jsonb(s.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_sante s WHERE s.anamnesis_id = a.id) AS sante,
        (SELECT to_jsonb(sb.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_sante_bilan sb WHERE sb.anamnesis_id = a.id) AS sante_bilan,
        (SELECT to_jsonb(hab.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_habitudes hab WHERE hab.anamnesis_id = a.id) AS habitudes,
        (SELECT to_jsonb(c.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_consommation c WHERE c.anamnesis_id = a.id) AS consommation,
        (SELECT to_jsonb(l.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_lifestyle l WHERE l.anamnesis_id = a.id) AS lifestyle,
        (SELECT to_jsonb(mot.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_motivation mot WHERE mot.anamnesis_id = a.id) AS motivation,
        (SELECT to_jsonb(p.*) - 'id' - 'anamnesis_id' - 'created_at' - 'updated_at'
         FROM anamnesis_psycho p WHERE p.anamnesis_id = a.id) AS psycho
    FROM anamneses a
    WHERE a.patient_id = p_patient_id
        AND a.is_current = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE anamnesis_identite IS 'Section Identité & Coordonnées de l''anamnèse';
COMMENT ON TABLE anamnesis_morphologie IS 'Section Données morphologiques de l''anamnèse';
COMMENT ON TABLE anamnesis_historique IS 'Section Historique pondéral de l''anamnèse';
COMMENT ON TABLE anamnesis_sante IS 'Section État de santé de l''anamnèse';
COMMENT ON TABLE anamnesis_sante_bilan IS 'Section Bilan digestif & biologique de l''anamnèse';
COMMENT ON TABLE anamnesis_habitudes IS 'Section Habitudes alimentaires de l''anamnèse';
COMMENT ON TABLE anamnesis_consommation IS 'Section Consommation & Boissons de l''anamnèse';
COMMENT ON TABLE anamnesis_lifestyle IS 'Section Mode de vie de l''anamnèse';
COMMENT ON TABLE anamnesis_motivation IS 'Section Motivation & Objectifs de l''anamnèse';
COMMENT ON TABLE anamnesis_psycho IS 'Section Psycho-comportemental de l''anamnèse';
COMMENT ON FUNCTION get_current_anamnesis_v2 IS 'Récupère l''anamnèse courante avec tables normalisées';

-- ============================================================================
-- COLUMN COMMENTS (unités de mesure)
-- ============================================================================

COMMENT ON COLUMN anamnesis_morphologie.taille IS 'Taille en cm';
COMMENT ON COLUMN anamnesis_morphologie.poids_initial IS 'Poids initial en kg';
COMMENT ON COLUMN anamnesis_morphologie.poids_ideal IS 'Poids idéal en kg';
COMMENT ON COLUMN anamnesis_morphologie.tour_taille IS 'Tour de taille en cm';
COMMENT ON COLUMN anamnesis_morphologie.tour_hanches IS 'Tour de hanches en cm';
COMMENT ON COLUMN anamnesis_morphologie.tour_poignet IS 'Tour de poignet en cm';
COMMENT ON COLUMN anamnesis_morphologie.tour_bras IS 'Tour de bras en cm';
COMMENT ON COLUMN anamnesis_morphologie.masse_grasse IS 'Masse grasse en %';
COMMENT ON COLUMN anamnesis_morphologie.masse_musculaire IS 'Masse musculaire en %';
COMMENT ON COLUMN anamnesis_morphologie.masse_hydrique IS 'Masse hydrique en %';

COMMENT ON COLUMN anamnesis_sante_bilan.glycemie_jeun IS 'Glycémie à jeun en g/L';
COMMENT ON COLUMN anamnesis_sante_bilan.hba1c IS 'HbA1c en %';
COMMENT ON COLUMN anamnesis_sante_bilan.cholesterol_total IS 'Cholestérol total en g/L';
COMMENT ON COLUMN anamnesis_sante_bilan.hdl IS 'HDL en g/L';
COMMENT ON COLUMN anamnesis_sante_bilan.ldl IS 'LDL en g/L';
COMMENT ON COLUMN anamnesis_sante_bilan.triglycerides IS 'Triglycérides en g/L';
COMMENT ON COLUMN anamnesis_sante_bilan.tsh IS 'TSH en mUI/L';
COMMENT ON COLUMN anamnesis_sante_bilan.ferritine IS 'Fer/Ferritine en µg/L';
COMMENT ON COLUMN anamnesis_sante_bilan.vitamine_d IS 'Vitamine D en ng/mL';
COMMENT ON COLUMN anamnesis_sante_bilan.vitamine_b12 IS 'Vitamine B12 en pg/mL';
COMMENT ON COLUMN anamnesis_sante_bilan.creatinine IS 'Créatinine en mg/L';

COMMENT ON COLUMN anamnesis_lifestyle.sommeil_heures IS 'Heures de sommeil par nuit';
COMMENT ON COLUMN anamnesis_lifestyle.qualite_sommeil IS 'Qualité du sommeil (échelle 1-5)';
COMMENT ON COLUMN anamnesis_lifestyle.stress IS 'Niveau de stress (échelle 1-5)';

COMMENT ON COLUMN anamnesis_motivation.objectif_poids IS 'Objectif de poids en kg';
COMMENT ON COLUMN anamnesis_motivation.motivation IS 'Niveau de motivation (échelle 1-10)';

COMMENT ON COLUMN anamnesis_psycho.relation_nourriture IS 'Relation à la nourriture (1=Très restrictive, 5=Décomplexée)';
COMMENT ON COLUMN anamnesis_psycho.alimentation_emotionnelle IS 'Alimentation émotionnelle (1=Jamais, 5=Très fréquente)';
COMMENT ON COLUMN anamnesis_psycho.image_corporelle IS 'Image corporelle (1=Très négative, 5=Très positive)';
