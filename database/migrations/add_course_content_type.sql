-- ============================================================================
-- Migration: Add 'course' to content_type enum
-- IMPORTANT: Must be run SEPARATELY before create_course_sections.sql
--            PostgreSQL requires new enum values to be committed before use.
-- ============================================================================

ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'course';
