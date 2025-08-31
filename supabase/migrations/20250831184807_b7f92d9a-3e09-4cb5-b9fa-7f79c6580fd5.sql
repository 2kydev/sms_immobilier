-- Fix migration: add surface_unit JSON to existing terrains where missing, casting text -> jsonb
UPDATE properties 
SET autres_details = (
  COALESCE(autres_details::jsonb, '{}'::jsonb) || '{"surface_unit":"m2"}'::jsonb
)::text
WHERE type = 'terrain'
  AND (autres_details IS NULL OR NOT (autres_details::jsonb ? 'surface_unit'));