-- =====================================================
-- ROLLBACK: Remove 'postponed' status from appointment_status enum
-- Annule add_postponed_status.sql
-- Script idempotent (safe to re-run after partial failures)
-- =====================================================

-- 1. Remove notification types
DELETE FROM notification_types WHERE code = 'appointment_postponed';
DELETE FROM notification_types WHERE code = 'appointment_reminder_mark_status';

-- 2. Drop triggers
DROP TRIGGER IF EXISTS trigger_create_appointment_reminders ON appointments;
DROP TRIGGER IF EXISTS trigger_log_appointment_change ON appointments;
DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;

-- 3. Drop RLS policies
DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Nutritionists can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Nutritionists can manage their appointments" ON appointments;

-- 4. Drop partial indexes that reference status enum
DROP INDEX IF EXISTS idx_appointments_upcoming;
DROP INDEX IF EXISTS idx_appointments_nutritionist_upcoming;
DROP INDEX IF EXISTS idx_appointments_status;

-- 5. Drop default
ALTER TABLE appointments ALTER COLUMN status DROP DEFAULT;

-- 6. Migrate postponed rows and convert all enum columns to TEXT
DO $$
BEGIN
  -- appointments.status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'status'
    AND udt_name != 'text'
  ) THEN
    UPDATE appointments
    SET status = 'cancelled_by_nutritionist',
        status_reason = CONCAT('postponed:', COALESCE(status_reason, ''))
    WHERE status = 'postponed';

    ALTER TABLE appointments ALTER COLUMN status TYPE text USING status::text;
  END IF;

  -- appointment_changes.old_status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointment_changes' AND column_name = 'old_status'
    AND udt_name != 'text'
  ) THEN
    ALTER TABLE appointment_changes ALTER COLUMN old_status TYPE text USING old_status::text;
  END IF;

  -- appointment_changes.new_status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointment_changes' AND column_name = 'new_status'
    AND udt_name != 'text'
  ) THEN
    ALTER TABLE appointment_changes ALTER COLUMN new_status TYPE text USING new_status::text;
  END IF;
END $$;

-- 7. Drop ALL appointment_status types (including _old from previous partial runs)
DROP TYPE IF EXISTS appointment_status;
DROP TYPE IF EXISTS appointment_status_old;

-- 8. Recreate enum without 'postponed'
CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'cancelled_by_patient',
  'cancelled_by_nutritionist',
  'completed',
  'no_show',
  'counter_proposed'
);

-- 9. Convert columns back to enum
ALTER TABLE appointments
  ALTER COLUMN status TYPE appointment_status
  USING status::appointment_status;

ALTER TABLE appointment_changes
  ALTER COLUMN old_status TYPE appointment_status
  USING old_status::appointment_status;

ALTER TABLE appointment_changes
  ALTER COLUMN new_status TYPE appointment_status
  USING new_status::appointment_status;

-- 10. Restore default
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'pending'::appointment_status;

-- 11. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming ON appointments(user_id, scheduled_at)
    WHERE status IN ('pending', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist_upcoming ON appointments(nutritionist_id, scheduled_at)
    WHERE status IN ('pending', 'confirmed');

-- 12. Recreate triggers
CREATE TRIGGER trigger_create_appointment_reminders
    AFTER INSERT ON appointments
    FOR EACH ROW
    WHEN (NEW.status IN ('pending', 'confirmed'))
    EXECUTE FUNCTION create_appointment_reminders();

CREATE TRIGGER trigger_log_appointment_change
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION log_appointment_change();

CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 13. Recreate RLS policies
CREATE POLICY "Patients can view own appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update own appointments"
    ON appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
        AND status IN ('pending', 'confirmed')
        AND scheduled_at > now() + interval '24 hours'
    );

CREATE POLICY "Nutritionists can view their appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = appointments.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );

CREATE POLICY "Nutritionists can manage their appointments"
    ON appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = appointments.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );
