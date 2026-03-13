-- Migration: Add user reminder preferences table
-- Allows patients to customize their appointment reminder settings
-- The existing appointment_reminders table + trigger will use these preferences

-- 1. Create reminder preferences table
CREATE TABLE IF NOT EXISTS reminder_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    email_hours_before INTEGER NOT NULL DEFAULT 24,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    push_hours_before INTEGER NOT NULL DEFAULT 1,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    sms_hours_before INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_preferences UNIQUE (user_id),
    CONSTRAINT valid_email_hours CHECK (email_hours_before BETWEEN 1 AND 72),
    CONSTRAINT valid_push_hours CHECK (push_hours_before BETWEEN 1 AND 48),
    CONSTRAINT valid_sms_hours CHECK (sms_hours_before BETWEEN 1 AND 48)
);

-- 2. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_reminder_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reminder_preferences_updated_at
    BEFORE UPDATE ON reminder_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_reminder_preferences_updated_at();

-- 3. RLS policies
ALTER TABLE reminder_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own reminder preferences"
    ON reminder_preferences FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert own reminder preferences"
    ON reminder_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own reminder preferences"
    ON reminder_preferences FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4. Add 'enabled' column to appointment_reminders (allows per-appointment toggling)
ALTER TABLE appointment_reminders
    ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true;

-- 5. Update the trigger function to use preferences when creating reminders
CREATE OR REPLACE FUNCTION create_appointment_reminders()
RETURNS TRIGGER AS $$
DECLARE
    v_prefs RECORD;
    v_user_auth_id UUID;
BEGIN
    -- Get the auth user_id from patient_profiles
    SELECT pp.user_id INTO v_user_auth_id
    FROM patient_profiles pp
    WHERE pp.id = NEW.user_id;

    -- Get user preferences (or use defaults)
    SELECT
        COALESCE(rp.email_enabled, true) as email_enabled,
        COALESCE(rp.email_hours_before, 24) as email_hours_before,
        COALESCE(rp.push_enabled, true) as push_enabled,
        COALESCE(rp.push_hours_before, 1) as push_hours_before
    INTO v_prefs
    FROM reminder_preferences rp
    WHERE rp.user_id = v_user_auth_id;

    -- If no preferences found, use defaults
    IF NOT FOUND THEN
        v_prefs.email_enabled := true;
        v_prefs.email_hours_before := 24;
        v_prefs.push_enabled := true;
        v_prefs.push_hours_before := 1;
    END IF;

    -- Create email reminder
    INSERT INTO appointment_reminders (
        appointment_id, reminder_type, remind_before_hours, scheduled_for, enabled
    ) VALUES (
        NEW.id,
        'email',
        v_prefs.email_hours_before,
        NEW.scheduled_at - (v_prefs.email_hours_before || ' hours')::INTERVAL,
        v_prefs.email_enabled
    );

    -- Create push reminder
    INSERT INTO appointment_reminders (
        appointment_id, reminder_type, remind_before_hours, scheduled_for, enabled
    ) VALUES (
        NEW.id,
        'push',
        v_prefs.push_hours_before,
        NEW.scheduled_at - (v_prefs.push_hours_before || ' hours')::INTERVAL,
        v_prefs.push_enabled
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Index for performance
CREATE INDEX IF NOT EXISTS idx_reminder_preferences_user_id
    ON reminder_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_appointment_reminders_enabled
    ON appointment_reminders(enabled) WHERE enabled = true;
