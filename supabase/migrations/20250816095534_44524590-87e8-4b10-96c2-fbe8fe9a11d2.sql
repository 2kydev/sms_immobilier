-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Créer une fonction security definer pour éviter la récursion RLS
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- Créer les nouvelles politiques sans récursion
CREATE POLICY "Admins can insert profiles" ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin' OR auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE 
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin' OR auth.uid() = id);