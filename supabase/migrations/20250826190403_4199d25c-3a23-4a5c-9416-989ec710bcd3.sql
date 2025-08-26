-- Security Fix: Implement proper Role-Based Access Control (RBAC) RLS policies

-- First, create a helper function to get user role securely
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all operations on properties" ON public.properties;
DROP POLICY IF EXISTS "Allow all operations on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;

-- CLIENTS TABLE: Restrict to authenticated users with proper roles
CREATE POLICY "Authenticated users can view clients" 
ON public.clients 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can create clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can update clients" 
ON public.clients 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Admins and DG can delete clients" 
ON public.clients 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg')
);

-- PROPERTIES TABLE: Restrict to authenticated users with proper roles
CREATE POLICY "Authenticated users can view properties" 
ON public.properties 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can create properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can update properties" 
ON public.properties 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Admins and DG can delete properties" 
ON public.properties 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg')
);

-- VISITS TABLE: Restrict to authenticated users with proper roles
CREATE POLICY "Authenticated users can view visits" 
ON public.visits 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can create visits" 
ON public.visits 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can update visits" 
ON public.visits 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Admins and DG can delete visits" 
ON public.visits 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg')
);

-- TRANSACTIONS TABLE: Restrict to authenticated users with proper roles
CREATE POLICY "Authenticated users can view transactions" 
ON public.transactions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Authenticated users can update transactions" 
ON public.transactions 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg', 'commercial', 'agent')
);

CREATE POLICY "Admins and DG can delete transactions" 
ON public.transactions 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg')
);

-- EMAIL_LOGS TABLE: Restrict to admin/dg only (sensitive operation logs)
DROP POLICY IF EXISTS "Utilisateurs peuvent voir les logs d'emails" ON public.email_logs;
DROP POLICY IF EXISTS "Utilisateurs peuvent créer des logs d'emails" ON public.email_logs;

CREATE POLICY "Only admins and DG can view email logs" 
ON public.email_logs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg')
);

CREATE POLICY "Only admins and DG can create email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) IN ('admin', 'dg')
);

-- Add indexes for better performance on role checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);