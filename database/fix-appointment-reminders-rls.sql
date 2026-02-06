-- ============================================================================
-- Fix: RLS policy for appointment_reminders trigger
-- ============================================================================
-- Problème: Le trigger create_appointment_reminders() échoue car il n'y a pas
-- de politique INSERT sur appointment_reminders.
--
-- Solution: Utiliser SECURITY DEFINER pour que la fonction s'exécute avec les
-- droits du propriétaire (bypass RLS) au lieu de l'appelant.
-- ============================================================================

-- ============================================================================
-- FIX 1: create_appointment_reminders() avec SECURITY DEFINER
-- ============================================================================
-- Cela permet au trigger de bypass RLS lors de l'insertion des rappels

CREATE OR REPLACE FUNCTION create_appointment_reminders()
RETURNS TRIGGER
SECURITY DEFINER  -- Important: exécute avec les droits du propriétaire
SET search_path = public
AS $$
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

-- ============================================================================
-- FIX 2: log_appointment_change() avec SECURITY DEFINER
-- ============================================================================
-- Même problème: cette fonction insère dans appointment_changes sans politique INSERT

CREATE OR REPLACE FUNCTION log_appointment_change()
RETURNS TRIGGER
SECURITY DEFINER  -- Important: exécute avec les droits du propriétaire
SET search_path = public
AS $$
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

-- ============================================================================
-- Option alternative: Ajouter une politique INSERT (moins sécurisé)
-- Décommenter si vous préférez cette approche
-- ============================================================================

/*
-- Permettre l'insertion via le trigger (basé sur l'appointment créé)
DROP POLICY IF EXISTS "System can create appointment reminders" ON appointment_reminders;
CREATE POLICY "System can create appointment reminders"
    ON appointment_reminders FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN patient_profiles pp ON pp.id = a.patient_id
            WHERE a.id = appointment_reminders.appointment_id
              AND pp.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN nutritionist_profiles np ON np.id = a.nutritionist_id
            WHERE a.id = appointment_reminders.appointment_id
              AND np.user_id = auth.uid()
        )
    );
*/

-- ============================================================================
-- Vérification
-- ============================================================================

-- 1. Vérifier que la fonction a bien été mise à jour
SELECT
    proname as function_name,
    prosecdef as security_definer,
    proconfig as config
FROM pg_proc
WHERE proname = 'create_appointment_reminders';

-- 2. Vérifier la structure de la table appointments (patient_id ou user_id?)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'appointments'
  AND column_name IN ('patient_id', 'user_id')
ORDER BY column_name;

-- 3. Vérifier les politiques RLS sur appointment_reminders
SELECT policyname, cmd, qual::text
FROM pg_policies
WHERE tablename = 'appointment_reminders';
