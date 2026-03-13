-- Migration: Add status column to consultations table
-- Allows distinguishing between draft and finalized consultation reports
-- Drafts are only visible to the nutritionist, not to the patient

-- Create the enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultation_status') THEN
        CREATE TYPE consultation_status AS ENUM ('draft', 'final');
    END IF;
END$$;

-- Add the column with default 'final' (so existing consultations are considered finalized)
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS status consultation_status NOT NULL DEFAULT 'final';

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations (status);
