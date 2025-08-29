-- Allow archived status for properties
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_statut_check;

-- Recreate the constraint including the new status value
ALTER TABLE public.properties
ADD CONSTRAINT properties_statut_check
CHECK (statut IN ('disponible', 'sous-offre', 'vendu', 'loue', 'archivé'))
NOT VALID;