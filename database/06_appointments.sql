-- ============================================================================
-- NutriSensia Database Schema
-- Script 06: Agenda et Rendez-vous
-- ============================================================================
-- Dépendances: 02_patient_nutritionist.sql
-- User Stories: AGENDA-001 à AGENDA-010, AUTH-005, DASH-005
-- ============================================================================

-- ===========================================
-- TABLE: consultation_types
-- Types de consultation disponibles
-- ===========================================

CREATE TABLE IF NOT EXISTS consultation_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    code varchar(50) NOT NULL UNIQUE,                -- 'initial', 'follow_up', etc.
    name_fr varchar(100) NOT NULL,
    name_en varchar(100),
    description_fr text,
    description_en text,

    -- Durée et tarif par défaut
    default_duration int NOT NULL,                   -- minutes
    default_price decimal(10,2),                     -- CHF

    -- Configuration
    requires_previous_consultation boolean DEFAULT false,
    min_notice_hours int DEFAULT 24,                 -- heures minimum avant RDV
    max_advance_days int DEFAULT 60,                 -- jours maximum à l'avance
    cancellation_hours int DEFAULT 24,               -- heures avant pour annulation gratuite

    -- Modes disponibles
    visio_available boolean DEFAULT true,
    cabinet_available boolean DEFAULT true,
    phone_available boolean DEFAULT false,

    -- Affichage
    icon varchar(10),
    color varchar(20),
    sort_order int DEFAULT 0,
    is_active boolean DEFAULT true,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Commentaires
COMMENT ON TABLE consultation_types IS 'Types de consultation disponibles (AGENDA-003)';

-- ===========================================
-- TABLE: nutritionist_availability
-- Disponibilités des nutritionnistes
-- ===========================================

CREATE TABLE IF NOT EXISTS nutritionist_availability (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nutritionist_id uuid NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,

    -- Type de disponibilité
    availability_type varchar(20) NOT NULL DEFAULT 'recurring',  -- 'recurring', 'exception', 'blocked'

    -- Pour les disponibilités récurrentes
    day_of_week int,                                 -- 0=dimanche, 1=lundi, etc.
    start_time time NOT NULL,
    end_time time NOT NULL,

    -- Pour les exceptions (dates spécifiques)
    specific_date date,

    -- Consultation type spécifique (optionnel)
    consultation_type_id uuid REFERENCES consultation_types(id) ON DELETE SET NULL,

    -- Modes disponibles pour ce créneau
    visio_available boolean DEFAULT true,
    cabinet_available boolean DEFAULT true,

    -- Capacité
    max_appointments int DEFAULT 1,                  -- Nombre max de RDV sur ce créneau

    -- Période de validité (pour recurring)
    valid_from date DEFAULT CURRENT_DATE,
    valid_until date,

    -- Notes internes
    notes text,

    -- Statut
    is_active boolean DEFAULT true,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_availability_nutritionist ON nutritionist_availability(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON nutritionist_availability(day_of_week) WHERE availability_type = 'recurring';
CREATE INDEX IF NOT EXISTS idx_availability_date ON nutritionist_availability(specific_date) WHERE availability_type != 'recurring';

-- Commentaires
COMMENT ON TABLE nutritionist_availability IS 'Disponibilités des nutritionnistes pour prise de RDV (AGENDA-004)';

-- ===========================================
-- TABLE: appointments
-- Rendez-vous
-- ===========================================

CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Participants
    patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    nutritionist_id uuid NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,

    -- Type de consultation
    consultation_type_id uuid REFERENCES consultation_types(id) ON DELETE SET NULL,
    consultation_type_code varchar(50),              -- Copie pour historique

    -- Date et heure
    scheduled_at timestamptz NOT NULL,
    scheduled_end_at timestamptz NOT NULL,
    duration int NOT NULL,                           -- minutes
    timezone varchar(50) DEFAULT 'Europe/Zurich',

    -- Mode
    mode consultation_mode NOT NULL,
    location text,                                   -- Adresse si cabinet, lien si visio

    -- Visio
    visio_link text,                                 -- Lien de visioconférence
    visio_room_id varchar(100),                      -- ID de la room si généré

    -- Statut
    status appointment_status DEFAULT 'pending',
    status_changed_at timestamptz DEFAULT now(),
    status_reason text,                              -- Raison d'annulation, etc.

    -- Rappels (AGENDA-009)
    reminder_email_sent boolean DEFAULT false,
    reminder_email_sent_at timestamptz,
    reminder_push_sent boolean DEFAULT false,
    reminder_push_sent_at timestamptz,

    -- Notes
    patient_message text,                            -- Message du patient à la réservation
    nutritionist_notes_internal text,                -- Notes internes du nutritionniste

    -- Tarification
    price decimal(10,2),
    currency varchar(3) DEFAULT 'CHF',
    is_paid boolean DEFAULT false,
    paid_at timestamptz,
    payment_reference varchar(100),

    -- Lien avec consultation (après le RDV)
    consultation_id uuid,                            -- Sera lié après la consultation

    -- Métadonnées
    booking_source varchar(50) DEFAULT 'web',        -- 'web', 'mobile', 'phone', 'nutritionist'
    is_first_consultation boolean DEFAULT false,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    cancelled_at timestamptz,
    cancelled_by uuid REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist ON appointments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming ON appointments(patient_id, scheduled_at)
    WHERE status IN ('pending', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist_upcoming ON appointments(nutritionist_id, scheduled_at)
    WHERE status IN ('pending', 'confirmed');

-- Contrainte: fin après début
ALTER TABLE appointments
    ADD CONSTRAINT appointments_check_dates
    CHECK (scheduled_end_at > scheduled_at);

-- Commentaires
COMMENT ON TABLE appointments IS 'Rendez-vous entre patients et nutritionnistes';
COMMENT ON COLUMN appointments.visio_link IS 'Lien de visioconférence (AGENDA-010)';
COMMENT ON COLUMN appointments.patient_message IS 'Message optionnel du patient (AGENDA-006)';

-- ===========================================
-- TABLE: appointment_reminders
-- Configuration des rappels pour chaque RDV
-- ===========================================

CREATE TABLE IF NOT EXISTS appointment_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,

    -- Type de rappel
    reminder_type varchar(20) NOT NULL,              -- 'email', 'push', 'sms'
    remind_before_hours int NOT NULL,                -- Heures avant le RDV

    -- État
    scheduled_for timestamptz NOT NULL,
    sent boolean DEFAULT false,
    sent_at timestamptz,
    failed boolean DEFAULT false,
    failure_reason text,

    -- Audit
    created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON appointment_reminders(scheduled_for)
    WHERE sent = false AND failed = false;

-- Commentaires
COMMENT ON TABLE appointment_reminders IS 'Rappels programmés pour les rendez-vous (AGENDA-009)';

-- ===========================================
-- TABLE: appointment_changes
-- Historique des modifications de RDV (AGENDA-007, AGENDA-008)
-- ===========================================

CREATE TABLE IF NOT EXISTS appointment_changes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,

    -- Type de changement
    change_type varchar(50) NOT NULL,                -- 'rescheduled', 'cancelled', 'mode_changed', 'status_changed'

    -- Anciennes valeurs
    old_scheduled_at timestamptz,
    old_status appointment_status,
    old_mode consultation_mode,

    -- Nouvelles valeurs
    new_scheduled_at timestamptz,
    new_status appointment_status,
    new_mode consultation_mode,

    -- Contexte
    reason text,
    changed_by uuid REFERENCES auth.users(id),
    changed_by_role varchar(20),                     -- 'patient', 'nutritionist', 'system'

    -- Audit
    created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_appointment_changes_appointment ON appointment_changes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_changes_date ON appointment_changes(created_at);

-- Commentaires
COMMENT ON TABLE appointment_changes IS 'Historique des modifications de rendez-vous pour traçabilité';

-- ===========================================
-- FONCTIONS
-- ===========================================

-- Fonction pour vérifier la disponibilité d'un créneau
CREATE OR REPLACE FUNCTION check_slot_availability(
    nutritionist_id_param uuid,
    slot_start timestamptz,
    slot_end timestamptz,
    exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    conflict_count int;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM appointments
    WHERE nutritionist_id = nutritionist_id_param
      AND status IN ('pending', 'confirmed')
      AND id != COALESCE(exclude_appointment_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
          (scheduled_at, scheduled_end_at) OVERLAPS (slot_start, slot_end)
      );

    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les créneaux disponibles d'un nutritionniste
CREATE OR REPLACE FUNCTION get_available_slots(
    nutritionist_id_param uuid,
    start_date date,
    end_date date,
    consultation_type_code_param varchar DEFAULT NULL
)
RETURNS TABLE (
    slot_date date,
    slot_start time,
    slot_end time,
    visio_available boolean,
    cabinet_available boolean
) AS $$
BEGIN
    -- Cette fonction retourne les créneaux basés sur les disponibilités
    -- et exclut ceux qui ont déjà des RDV
    RETURN QUERY
    SELECT DISTINCT
        d.date::date as slot_date,
        na.start_time as slot_start,
        na.end_time as slot_end,
        na.visio_available,
        na.cabinet_available
    FROM nutritionist_availability na
    CROSS JOIN generate_series(start_date, end_date, '1 day'::interval) as d(date)
    WHERE na.nutritionist_id = nutritionist_id_param
      AND na.is_active = true
      AND na.availability_type = 'recurring'
      AND na.day_of_week = EXTRACT(DOW FROM d.date)
      AND (na.valid_from IS NULL OR d.date >= na.valid_from)
      AND (na.valid_until IS NULL OR d.date <= na.valid_until)
      AND NOT EXISTS (
          -- Exclure les dates bloquées
          SELECT 1 FROM nutritionist_availability blocked
          WHERE blocked.nutritionist_id = nutritionist_id_param
            AND blocked.availability_type = 'blocked'
            AND blocked.specific_date = d.date
      )
      AND check_slot_availability(
          nutritionist_id_param,
          (d.date + na.start_time)::timestamptz,
          (d.date + na.end_time)::timestamptz
      )
    ORDER BY slot_date, slot_start;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer les rappels automatiques
CREATE OR REPLACE FUNCTION create_appointment_reminders()
RETURNS TRIGGER AS $$
BEGIN
    -- Rappel email J-1
    INSERT INTO appointment_reminders (appointment_id, reminder_type, remind_before_hours, scheduled_for)
    VALUES (NEW.id, 'email', 24, NEW.scheduled_at - interval '24 hours');

    -- Rappel push H-1
    INSERT INTO appointment_reminders (appointment_id, reminder_type, remind_before_hours, scheduled_for)
    VALUES (NEW.id, 'push', 1, NEW.scheduled_at - interval '1 hour');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer les rappels automatiquement
DROP TRIGGER IF EXISTS trigger_create_appointment_reminders ON appointments;
CREATE TRIGGER trigger_create_appointment_reminders
    AFTER INSERT ON appointments
    FOR EACH ROW
    WHEN (NEW.status IN ('pending', 'confirmed'))
    EXECUTE FUNCTION create_appointment_reminders();

-- Fonction pour logger les changements de RDV
CREATE OR REPLACE FUNCTION log_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le statut change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO appointment_changes (
            appointment_id, change_type,
            old_status, new_status,
            reason, changed_by, changed_by_role
        ) VALUES (
            NEW.id, 'status_changed',
            OLD.status, NEW.status,
            NEW.status_reason, auth.uid(),
            CASE
                WHEN EXISTS (SELECT 1 FROM nutritionist_profiles WHERE user_id = auth.uid()) THEN 'nutritionist'
                WHEN EXISTS (SELECT 1 FROM patient_profiles WHERE user_id = auth.uid()) THEN 'patient'
                ELSE 'system'
            END
        );
    END IF;

    -- Si la date change
    IF OLD.scheduled_at IS DISTINCT FROM NEW.scheduled_at THEN
        INSERT INTO appointment_changes (
            appointment_id, change_type,
            old_scheduled_at, new_scheduled_at,
            changed_by, changed_by_role
        ) VALUES (
            NEW.id, 'rescheduled',
            OLD.scheduled_at, NEW.scheduled_at,
            auth.uid(),
            CASE
                WHEN EXISTS (SELECT 1 FROM nutritionist_profiles WHERE user_id = auth.uid()) THEN 'nutritionist'
                WHEN EXISTS (SELECT 1 FROM patient_profiles WHERE user_id = auth.uid()) THEN 'patient'
                ELSE 'system'
            END
        );
    END IF;

    -- Si le mode change
    IF OLD.mode IS DISTINCT FROM NEW.mode THEN
        INSERT INTO appointment_changes (
            appointment_id, change_type,
            old_mode, new_mode,
            changed_by, changed_by_role
        ) VALUES (
            NEW.id, 'mode_changed',
            OLD.mode, NEW.mode,
            auth.uid(),
            CASE
                WHEN EXISTS (SELECT 1 FROM nutritionist_profiles WHERE user_id = auth.uid()) THEN 'nutritionist'
                WHEN EXISTS (SELECT 1 FROM patient_profiles WHERE user_id = auth.uid()) THEN 'patient'
                ELSE 'system'
            END
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour logger les modifications
DROP TRIGGER IF EXISTS trigger_log_appointment_change ON appointments;
CREATE TRIGGER trigger_log_appointment_change
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION log_appointment_change();

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_changes ENABLE ROW LEVEL SECURITY;

-- Politiques pour consultation_types (lecture publique)
DROP POLICY IF EXISTS "Anyone can view consultation types" ON consultation_types;
CREATE POLICY "Anyone can view consultation types"
    ON consultation_types FOR SELECT
    USING (is_active = true);

-- Politiques pour nutritionist_availability
DROP POLICY IF EXISTS "Nutritionists can manage own availability" ON nutritionist_availability;
CREATE POLICY "Nutritionists can manage own availability"
    ON nutritionist_availability FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = nutritionist_availability.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );

-- Les patients peuvent voir les disponibilités
DROP POLICY IF EXISTS "Patients can view nutritionist availability" ON nutritionist_availability;
CREATE POLICY "Patients can view nutritionist availability"
    ON nutritionist_availability FOR SELECT
    USING (is_active = true);

-- Politiques pour appointments
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
CREATE POLICY "Patients can view own appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.patient_id
              AND pp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.patient_id
              AND pp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;
CREATE POLICY "Patients can update own appointments"
    ON appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.patient_id
              AND pp.user_id = auth.uid()
        )
        AND status IN ('pending', 'confirmed')
        AND scheduled_at > now() + interval '24 hours'
    );

DROP POLICY IF EXISTS "Nutritionists can view their appointments" ON appointments;
CREATE POLICY "Nutritionists can view their appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = appointments.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Nutritionists can manage their appointments" ON appointments;
CREATE POLICY "Nutritionists can manage their appointments"
    ON appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = appointments.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );

-- Politiques pour appointment_reminders
DROP POLICY IF EXISTS "Users can view own appointment reminders" ON appointment_reminders;
CREATE POLICY "Users can view own appointment reminders"
    ON appointment_reminders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN patient_profiles pp ON pp.id = a.patient_id
            WHERE a.id = appointment_reminders.appointment_id
              AND pp.user_id = auth.uid()
        )
    );

-- Politiques pour appointment_changes
DROP POLICY IF EXISTS "Users can view own appointment changes" ON appointment_changes;
CREATE POLICY "Users can view own appointment changes"
    ON appointment_changes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN patient_profiles pp ON pp.id = a.patient_id
            WHERE a.id = appointment_changes.appointment_id
              AND pp.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN nutritionist_profiles np ON np.id = a.nutritionist_id
            WHERE a.id = appointment_changes.appointment_id
              AND np.user_id = auth.uid()
        )
    );

-- ===========================================
-- DONNÉES INITIALES
-- ===========================================

INSERT INTO consultation_types (code, name_fr, name_en, description_fr, default_duration, default_price, icon, color, sort_order) VALUES
    ('initial', 'Consultation initiale', 'Initial Consultation',
     'Première consultation pour établir votre profil et définir vos objectifs',
     60, 120.00, '🎯', '#10B981', 1),
    ('follow_up', 'Consultation de suivi', 'Follow-up Consultation',
     'Consultation régulière pour suivre vos progrès et ajuster votre plan',
     30, 80.00, '📊', '#3B82F6', 2),
    ('in_depth', 'Consultation approfondie', 'In-depth Consultation',
     'Consultation longue pour des sujets complexes ou une révision complète du plan',
     45, 110.00, '🔬', '#8B5CF6', 3),
    ('emergency', 'Consultation urgente', 'Emergency Consultation',
     'Consultation courte pour une question urgente',
     20, 50.00, '⚡', '#EF4444', 4)
ON CONFLICT (code) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    description_fr = EXCLUDED.description_fr,
    default_duration = EXCLUDED.default_duration,
    default_price = EXCLUDED.default_price;
