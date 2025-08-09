-- Fix properties.type check constraint to include 'entrepot'
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_type_check
  CHECK (type IN ('appartement','maison','studio','terrain','local','entrepot'));
