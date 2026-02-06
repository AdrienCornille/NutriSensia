-- ============================================================================
-- NutriSensia Database Schema - 17 Nutritionist Registration
-- ============================================================================
-- Phase: Role-based routing infrastructure
-- Dépendances: 02_patient_nutritionist.sql
-- User Stories: AUTH-008 à AUTH-013
-- ============================================================================

-- ============================================================================
-- PHASE 1: EXTEND nutritionist_profiles TABLE
-- Add columns for registration validation workflow
-- ============================================================================

DO $$
BEGIN
    -- Add status column for registration workflow
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE nutritionist_profiles
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending'
            CHECK (status IN ('pending', 'active', 'rejected', 'info_required', 'suspended'));

        -- Migrate existing active nutritionists
        UPDATE nutritionist_profiles SET status = 'active' WHERE is_active = true;
        UPDATE nutritionist_profiles SET status = 'suspended' WHERE is_active = false;

        RAISE NOTICE 'nutritionist_profiles: status column added ✓';
    END IF;

    -- Add rejection_reason column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN rejection_reason TEXT;
        RAISE NOTICE 'nutritionist_profiles: rejection_reason column added ✓';
    END IF;

    -- Add validated_at column (different from verified_at for explicit validation)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'validated_at'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN validated_at TIMESTAMPTZ;

        -- Copy existing verified_at values
        UPDATE nutritionist_profiles
        SET validated_at = verified_at
        WHERE verified_at IS NOT NULL;

        RAISE NOTICE 'nutritionist_profiles: validated_at column added ✓';
    END IF;

    -- Add validated_by column (admin who validated)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'validated_by'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN validated_by UUID REFERENCES profiles(id);
        RAISE NOTICE 'nutritionist_profiles: validated_by column added ✓';
    END IF;

    -- Add info_request_message column (admin asks for more info)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'info_request_message'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN info_request_message TEXT;
        RAISE NOTICE 'nutritionist_profiles: info_request_message column added ✓';
    END IF;

    -- Add info_response column (nutritionist's response)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'info_response'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN info_response TEXT;
        RAISE NOTICE 'nutritionist_profiles: info_response column added ✓';
    END IF;

    -- Add info_responded_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'info_responded_at'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN info_responded_at TIMESTAMPTZ;
        RAISE NOTICE 'nutritionist_profiles: info_responded_at column added ✓';
    END IF;

    -- Add ASCA number column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'asca_number'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN asca_number VARCHAR(50);
        RAISE NOTICE 'nutritionist_profiles: asca_number column added ✓';
    END IF;

    -- Add RME number column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'rme_number'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN rme_number VARCHAR(50);
        RAISE NOTICE 'nutritionist_profiles: rme_number column added ✓';
    END IF;

    -- Add years_experience column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'years_experience'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN years_experience INTEGER;
        RAISE NOTICE 'nutritionist_profiles: years_experience column added ✓';
    END IF;

    -- Add languages column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'nutritionist_profiles' AND column_name = 'languages'
    ) THEN
        ALTER TABLE nutritionist_profiles ADD COLUMN languages TEXT[] DEFAULT ARRAY['fr'];
        RAISE NOTICE 'nutritionist_profiles: languages column added ✓';
    END IF;
END $$;

-- Index for status queries (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_status
    ON nutritionist_profiles(status);

-- Index for pending registrations (sorted by date)
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_pending
    ON nutritionist_profiles(created_at DESC)
    WHERE status = 'pending';

-- ============================================================================
-- PHASE 2: CREATE nutritionist_documents TABLE
-- Stores uploaded documents for verification
-- ============================================================================

CREATE TABLE IF NOT EXISTS nutritionist_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relation
    nutritionist_id UUID NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,

    -- Type de document
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'asca_certificate',
        'rme_certificate',
        'diploma',
        'photo',
        'other'
    )),

    -- Fichier
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- en bytes
    mime_type VARCHAR(100),

    -- Description optionnelle
    description TEXT,

    -- Vérification par admin
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    verification_notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_nutritionist_documents_nutritionist
    ON nutritionist_documents(nutritionist_id);

CREATE INDEX IF NOT EXISTS idx_nutritionist_documents_type
    ON nutritionist_documents(nutritionist_id, type);

-- Trigger updated_at
DROP TRIGGER IF EXISTS nutritionist_documents_updated_at ON nutritionist_documents;
CREATE TRIGGER nutritionist_documents_updated_at
    BEFORE UPDATE ON nutritionist_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE nutritionist_documents IS 'Documents uploadés par les nutritionnistes pour vérification (AUTH-009)';
COMMENT ON COLUMN nutritionist_documents.type IS 'Type: asca_certificate, rme_certificate, diploma, photo, other';
COMMENT ON COLUMN nutritionist_documents.verified IS 'Document vérifié par un admin';

-- ============================================================================
-- PHASE 3: ROW LEVEL SECURITY for nutritionist_documents
-- ============================================================================

ALTER TABLE nutritionist_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Nutritionists can view own documents" ON nutritionist_documents;
DROP POLICY IF EXISTS "Nutritionists can insert own documents" ON nutritionist_documents;
DROP POLICY IF EXISTS "Nutritionists can delete own documents" ON nutritionist_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON nutritionist_documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON nutritionist_documents;

-- Nutritionist can view their own documents
CREATE POLICY "Nutritionists can view own documents"
    ON nutritionist_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = nutritionist_documents.nutritionist_id
            AND np.user_id = auth.uid()
        )
    );

-- Nutritionist can insert their own documents
CREATE POLICY "Nutritionists can insert own documents"
    ON nutritionist_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = nutritionist_documents.nutritionist_id
            AND np.user_id = auth.uid()
        )
    );

-- Nutritionist can delete their own unverified documents
CREATE POLICY "Nutritionists can delete own documents"
    ON nutritionist_documents FOR DELETE
    USING (
        verified = false
        AND EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = nutritionist_documents.nutritionist_id
            AND np.user_id = auth.uid()
        )
    );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
    ON nutritionist_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can manage all documents (update verification status)
CREATE POLICY "Admins can manage all documents"
    ON nutritionist_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- PHASE 4: UPDATE RLS POLICIES for nutritionist_profiles
-- Allow admin to manage nutritionist registrations
-- ============================================================================

-- Drop and recreate admin policy
DROP POLICY IF EXISTS "Admins can view all nutritionist profiles" ON nutritionist_profiles;
DROP POLICY IF EXISTS "Admins can manage all nutritionist profiles" ON nutritionist_profiles;

-- Admin can view all nutritionist profiles
CREATE POLICY "Admins can view all nutritionist profiles"
    ON nutritionist_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can manage all nutritionist profiles (validate/reject)
CREATE POLICY "Admins can manage all nutritionist profiles"
    ON nutritionist_profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow nutritionists to insert their own profile (during registration)
DROP POLICY IF EXISTS "Nutritionists can insert own profile" ON nutritionist_profiles;
CREATE POLICY "Nutritionists can insert own profile"
    ON nutritionist_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PHASE 5: FUNCTIONS for registration workflow
-- ============================================================================

-- Function to validate a nutritionist registration (AUTH-010)
CREATE OR REPLACE FUNCTION validate_nutritionist_registration(
    p_nutritionist_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_nutritionist RECORD;
BEGIN
    -- Check admin role
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can validate registrations';
    END IF;

    -- Get nutritionist
    SELECT * INTO v_nutritionist
    FROM nutritionist_profiles
    WHERE id = p_nutritionist_id;

    IF v_nutritionist IS NULL THEN
        RAISE EXCEPTION 'Nutritionist not found';
    END IF;

    IF v_nutritionist.status != 'pending' AND v_nutritionist.status != 'info_required' THEN
        RAISE EXCEPTION 'Can only validate pending or info_required registrations';
    END IF;

    -- Update nutritionist status
    UPDATE nutritionist_profiles
    SET
        status = 'active',
        is_active = true,
        validated_at = now(),
        validated_by = p_admin_id,
        verified_at = now()
    WHERE id = p_nutritionist_id;

    -- Update user role in profiles table
    UPDATE profiles
    SET role = 'nutritionist'
    WHERE id = v_nutritionist.user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a nutritionist registration (AUTH-010)
CREATE OR REPLACE FUNCTION reject_nutritionist_registration(
    p_nutritionist_id UUID,
    p_admin_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_nutritionist RECORD;
BEGIN
    -- Check admin role
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can reject registrations';
    END IF;

    -- Reason is required
    IF p_reason IS NULL OR p_reason = '' THEN
        RAISE EXCEPTION 'Rejection reason is required';
    END IF;

    -- Get nutritionist
    SELECT * INTO v_nutritionist
    FROM nutritionist_profiles
    WHERE id = p_nutritionist_id;

    IF v_nutritionist IS NULL THEN
        RAISE EXCEPTION 'Nutritionist not found';
    END IF;

    -- Update nutritionist status
    UPDATE nutritionist_profiles
    SET
        status = 'rejected',
        is_active = false,
        rejection_reason = p_reason,
        validated_at = now(),
        validated_by = p_admin_id
    WHERE id = p_nutritionist_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request more info (AUTH-010)
CREATE OR REPLACE FUNCTION request_nutritionist_info(
    p_nutritionist_id UUID,
    p_admin_id UUID,
    p_message TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_nutritionist RECORD;
BEGIN
    -- Check admin role
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can request info';
    END IF;

    -- Message is required
    IF p_message IS NULL OR p_message = '' THEN
        RAISE EXCEPTION 'Info request message is required';
    END IF;

    -- Get nutritionist
    SELECT * INTO v_nutritionist
    FROM nutritionist_profiles
    WHERE id = p_nutritionist_id;

    IF v_nutritionist IS NULL THEN
        RAISE EXCEPTION 'Nutritionist not found';
    END IF;

    -- Update nutritionist status
    UPDATE nutritionist_profiles
    SET
        status = 'info_required',
        info_request_message = p_message,
        info_response = NULL,
        info_responded_at = NULL
    WHERE id = p_nutritionist_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for nutritionist to respond to info request
CREATE OR REPLACE FUNCTION respond_to_info_request(
    p_nutritionist_id UUID,
    p_response TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_nutritionist RECORD;
BEGIN
    -- Get nutritionist
    SELECT * INTO v_nutritionist
    FROM nutritionist_profiles
    WHERE id = p_nutritionist_id AND user_id = auth.uid();

    IF v_nutritionist IS NULL THEN
        RAISE EXCEPTION 'Nutritionist not found or not authorized';
    END IF;

    IF v_nutritionist.status != 'info_required' THEN
        RAISE EXCEPTION 'No info request pending';
    END IF;

    -- Response is required
    IF p_response IS NULL OR p_response = '' THEN
        RAISE EXCEPTION 'Response is required';
    END IF;

    -- Update nutritionist with response and back to pending
    UPDATE nutritionist_profiles
    SET
        status = 'pending',
        info_response = p_response,
        info_responded_at = now()
    WHERE id = p_nutritionist_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get registration status for current user
CREATE OR REPLACE FUNCTION get_my_nutritionist_status()
RETURNS TABLE (
    status VARCHAR,
    rejection_reason TEXT,
    info_request_message TEXT,
    validated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        np.status,
        np.rejection_reason,
        np.info_request_message,
        np.validated_at
    FROM nutritionist_profiles np
    WHERE np.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending registrations count (for admin dashboard)
CREATE OR REPLACE FUNCTION get_pending_registrations_count()
RETURNS INTEGER AS $$
BEGIN
    -- Only admins can call this
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN 0;
    END IF;

    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM nutritionist_profiles
        WHERE status = 'pending'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 6: COMMENTS
-- ============================================================================

COMMENT ON FUNCTION validate_nutritionist_registration IS 'Valide une inscription nutritionniste (AUTH-010)';
COMMENT ON FUNCTION reject_nutritionist_registration IS 'Rejette une inscription nutritionniste avec motif (AUTH-010)';
COMMENT ON FUNCTION request_nutritionist_info IS 'Demande des informations supplémentaires (AUTH-010)';
COMMENT ON FUNCTION respond_to_info_request IS 'Permet au nutritionniste de répondre à une demande d''info';
COMMENT ON FUNCTION get_my_nutritionist_status IS 'Récupère le statut d''inscription du nutritionniste connecté';
COMMENT ON FUNCTION get_pending_registrations_count IS 'Compte les inscriptions en attente (admin)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Migration 17: Nutritionist Registration';
    RAISE NOTICE '============================================';
    RAISE NOTICE '- nutritionist_profiles: status, validation columns added';
    RAISE NOTICE '- nutritionist_profiles: ASCA/RME number columns added';
    RAISE NOTICE '- nutritionist_documents table created';
    RAISE NOTICE '- RLS policies updated for admin access';
    RAISE NOTICE '- Validation functions created';
    RAISE NOTICE '============================================';
END $$;
