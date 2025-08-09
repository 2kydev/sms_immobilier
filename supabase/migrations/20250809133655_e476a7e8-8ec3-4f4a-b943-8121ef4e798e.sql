-- Fix existing data: replace legacy value 'local' with 'entrepot'
BEGIN;
UPDATE public.properties SET type = 'entrepot' WHERE type = 'local';

-- Recreate the CHECK constraint to include 'immeuble'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_type_check CHECK (
  type IN ('terrain','maison','entrepot','immeuble')
);
COMMIT;