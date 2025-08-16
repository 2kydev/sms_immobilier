-- Permettre aux admins de créer et gérer les profils utilisateurs
CREATE POLICY "Admins can insert profiles" ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ) OR auth.uid() = id
);

-- Permettre aux admins de mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ) OR auth.uid() = id
);

-- Activer RLS sur la table transactions si pas déjà fait
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations sur les transactions
CREATE POLICY "Allow all operations on transactions" ON public.transactions
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);