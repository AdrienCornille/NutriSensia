-- ============================================================================
-- Debug function to check what auth.uid() returns in the database context
-- ============================================================================

-- Create a function that returns the current auth.uid()
CREATE OR REPLACE FUNCTION get_current_auth_uid()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER  -- Execute with privileges of the function creator
AS $$
  SELECT auth.uid();
$$;

-- Test: Call this function to see what auth.uid() returns
SELECT get_current_auth_uid();

-- Note: When called from the Supabase SQL Editor, this will return NULL
-- because the SQL Editor doesn't have an authenticated context.
-- When called from an API route with a valid session, it should return the user's ID.

-- You can also test directly:
SELECT auth.uid() AS current_user_id;

-- To verify RLS is working, try:
SELECT * FROM profiles WHERE id = auth.uid();
