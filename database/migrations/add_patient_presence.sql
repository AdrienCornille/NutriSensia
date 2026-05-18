-- Migration: Add presence tracking for patients
-- Adds last_seen_at to patient_profiles for online status display in messaging

ALTER TABLE patient_profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_patient_profiles_last_seen
  ON patient_profiles(last_seen_at) WHERE last_seen_at IS NOT NULL;
