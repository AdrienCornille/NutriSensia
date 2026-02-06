-- ============================================================================
-- NutriSensia Database Schema
-- Script 01: Extensions PostgreSQL et Types Enum
-- ============================================================================
-- Ce script doit être exécuté en premier car il définit les types utilisés
-- par toutes les autres tables.
-- ============================================================================

-- ===========================================
-- EXTENSIONS
-- ===========================================

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour les fonctions de texte avancées (recherche tolérante)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Extension pour le stockage de données (Supabase storage)
-- Note: Généralement déjà activée par Supabase
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- ===========================================
-- FONCTIONS UTILITAIRES
-- ===========================================

-- Fonction pour mettre à jour automatiquement updated_at
-- Utilisée par tous les triggers BEFORE UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Fonction trigger pour mettre à jour automatiquement le champ updated_at';

-- ===========================================
-- TYPES ENUM - Utilisateurs & Rôles
-- ===========================================

-- Rôle utilisateur (existe peut-être déjà via profiles)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'nutritionist', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut du profil patient
DO $$ BEGIN
    CREATE TYPE patient_status AS ENUM ('pending', 'active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sexe/Genre
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Rendez-vous
-- ===========================================

-- Type de consultation
DO $$ BEGIN
    CREATE TYPE consultation_type AS ENUM ('initial', 'follow_up', 'in_depth', 'emergency', 'check_in');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mode de consultation
DO $$ BEGIN
    CREATE TYPE consultation_mode AS ENUM ('visio', 'cabinet', 'phone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut du rendez-vous
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Repas
-- ===========================================

-- Type de repas
DO $$ BEGIN
    CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Contexte du repas (tags)
DO $$ BEGIN
    CREATE TYPE meal_context AS ENUM ('home', 'work', 'restaurant', 'takeaway', 'social', 'travel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Plan Alimentaire
-- ===========================================

-- Statut du plan alimentaire
DO $$ BEGIN
    CREATE TYPE meal_plan_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut de demande de modification
DO $$ BEGIN
    CREATE TYPE modification_request_status AS ENUM ('pending', 'approved', 'rejected', 'implemented');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Messagerie
-- ===========================================

-- Type de message
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'document', 'modification_request', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut du message
DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Notifications
-- ===========================================

-- Type de notification
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'appointment_reminder',
        'appointment_confirmed',
        'appointment_cancelled',
        'new_message',
        'plan_updated',
        'objective_achieved',
        'badge_earned',
        'streak_milestone',
        'document_shared',
        'questionnaire_pending',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Priorité de notification
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Contenu
-- ===========================================

-- Type de contenu exclusif
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('article', 'video', 'guide', 'podcast', 'infographic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Thème de contenu
DO $$ BEGIN
    CREATE TYPE content_theme AS ENUM (
        'nutrition_basics',
        'cooking_tips',
        'psychology',
        'sport',
        'health',
        'lifestyle',
        'recipes',
        'seasonal'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Biométrie
-- ===========================================

-- Niveau d'énergie
DO $$ BEGIN
    CREATE TYPE energy_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Humeur
DO $$ BEGIN
    CREATE TYPE mood AS ENUM ('very_bad', 'bad', 'neutral', 'good', 'very_good');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Qualité de digestion
DO $$ BEGIN
    CREATE TYPE digestion_quality AS ENUM ('poor', 'average', 'good', 'excellent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Intensité d'activité
DO $$ BEGIN
    CREATE TYPE activity_intensity AS ENUM ('light', 'moderate', 'vigorous', 'very_vigorous');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Gamification
-- ===========================================

-- Catégorie de badge
DO $$ BEGIN
    CREATE TYPE badge_category AS ENUM (
        'tracking',      -- Enregistrement régulier
        'nutrition',     -- Objectifs nutritionnels
        'hydration',     -- Hydratation
        'activity',      -- Activité physique
        'consistency',   -- Régularité
        'milestone',     -- Jalons (poids, etc.)
        'social',        -- Interaction avec nutritionniste
        'learning'       -- Parcours d'apprentissage
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Niveau de badge
DO $$ BEGIN
    CREATE TYPE badge_level AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type de streak
DO $$ BEGIN
    CREATE TYPE streak_type AS ENUM (
        'meal_logging',      -- Enregistrement des repas
        'hydration',         -- Hydratation quotidienne
        'weight_tracking',   -- Pesée régulière
        'wellbeing_logging', -- Log bien-être
        'activity'           -- Activité physique
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Documents
-- ===========================================

-- Type de document
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'blood_test',        -- Analyse de sang
        'medical_report',    -- Rapport médical
        'prescription',      -- Ordonnance
        'meal_photo',        -- Photo de repas
        'progress_photo',    -- Photo de progression
        'other'              -- Autre
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Paramètres
-- ===========================================

-- Thème d'interface
DO $$ BEGIN
    CREATE TYPE ui_theme AS ENUM ('light', 'dark', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Système d'unités
DO $$ BEGIN
    CREATE TYPE unit_system AS ENUM ('metric', 'imperial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Premier jour de la semaine
DO $$ BEGIN
    CREATE TYPE first_day_of_week AS ENUM ('monday', 'sunday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Objectifs
-- ===========================================

-- Catégorie d'objectif
DO $$ BEGIN
    CREATE TYPE objective_category AS ENUM (
        'weight',
        'nutrition',
        'hydration',
        'activity',
        'habit',
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut d'objectif
DO $$ BEGIN
    CREATE TYPE objective_status AS ENUM (
        'not_started',
        'in_progress',
        'on_track',
        'at_risk',
        'completed',
        'abandoned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Aliments
-- ===========================================

-- Catégorie d'aliment
DO $$ BEGIN
    CREATE TYPE food_category AS ENUM (
        'fruits',
        'vegetables',
        'grains',
        'proteins',
        'dairy',
        'fats_oils',
        'sweets',
        'beverages',
        'condiments',
        'prepared_foods',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Recettes
-- ===========================================

-- Catégorie de recette
DO $$ BEGIN
    CREATE TYPE recipe_category AS ENUM (
        'breakfast',
        'lunch',
        'dinner',
        'snack',
        'dessert',
        'beverage',
        'appetizer',
        'side_dish'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Difficulté de recette
DO $$ BEGIN
    CREATE TYPE recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut de recette
DO $$ BEGIN
    CREATE TYPE recipe_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Contenu Exclusif
-- ===========================================

-- Statut de contenu
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Dossier Patient
-- ===========================================

-- Statut de questionnaire
DO $$ BEGIN
    CREATE TYPE questionnaire_status AS ENUM ('pending', 'in_progress', 'completed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Adhérence Plan Alimentaire
-- ===========================================

-- Statut d'adhérence
DO $$ BEGIN
    CREATE TYPE adherence_status AS ENUM ('not_tracked', 'followed', 'partial', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Notifications (Catégorie)
-- ===========================================

-- Catégorie de notification
DO $$ BEGIN
    CREATE TYPE notification_category AS ENUM (
        'appointment',
        'message',
        'plan',
        'biometric',
        'content',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Messagerie (Attachement)
-- ===========================================

-- Type de pièce jointe
DO $$ BEGIN
    CREATE TYPE attachment_type AS ENUM ('image', 'document', 'audio', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TYPES ENUM - Biométrie (Mesures)
-- ===========================================

-- Type de mesure
DO $$ BEGIN
    CREATE TYPE measurement_type AS ENUM (
        'weight',
        'body_fat',
        'muscle_mass',
        'waist',
        'hip',
        'chest',
        'arm',
        'thigh',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'heart_rate',
        'blood_sugar'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- COMMENTAIRES
-- ===========================================

COMMENT ON TYPE user_role IS 'Rôle de l''utilisateur dans le système';
COMMENT ON TYPE patient_status IS 'Statut du profil patient';
COMMENT ON TYPE consultation_type IS 'Type de consultation avec le nutritionniste';
COMMENT ON TYPE consultation_mode IS 'Mode de consultation (visio, cabinet, téléphone)';
COMMENT ON TYPE appointment_status IS 'Statut du rendez-vous';
COMMENT ON TYPE meal_type IS 'Type de repas (petit-déjeuner, déjeuner, dîner, collation)';
COMMENT ON TYPE notification_type IS 'Type de notification système';
COMMENT ON TYPE badge_category IS 'Catégorie de badge pour la gamification';
COMMENT ON TYPE streak_type IS 'Type de streak pour le suivi de régularité';
COMMENT ON TYPE recipe_status IS 'Statut de publication d''une recette';
COMMENT ON TYPE content_status IS 'Statut de publication du contenu exclusif';
COMMENT ON TYPE questionnaire_status IS 'Statut d''un questionnaire patient';
COMMENT ON TYPE adherence_status IS 'Statut d''adhérence au plan alimentaire';
COMMENT ON TYPE notification_category IS 'Catégorie de notification système';
COMMENT ON TYPE attachment_type IS 'Type de pièce jointe dans la messagerie';
COMMENT ON TYPE measurement_type IS 'Type de mesure biométrique';
