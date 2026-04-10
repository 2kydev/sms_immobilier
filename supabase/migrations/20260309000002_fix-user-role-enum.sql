-- Fix: rename enum value 'directeur' to 'dg' to match frontend code
-- The frontend (useRole.tsx, AppSidebar.tsx, CreateUserForm.tsx) uses 'dg'
-- but the PostgreSQL enum was created with 'directeur'

DO $$
BEGIN
  -- Only rename if 'directeur' still exists in the enum
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'directeur'
  ) THEN
    ALTER TYPE public.user_role RENAME VALUE 'directeur' TO 'dg';

    -- Also update any existing profiles that have 'directeur' stored as text
    UPDATE public.profiles SET role = 'dg' WHERE role = 'directeur';
  END IF;
END$$;
