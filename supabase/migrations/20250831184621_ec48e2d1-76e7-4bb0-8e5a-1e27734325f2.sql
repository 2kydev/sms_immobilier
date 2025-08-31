-- Migration to add surface_unit to existing terrain properties
UPDATE properties 
SET autres_details = COALESCE(autres_details, '{}'::jsonb) || '{"surface_unit": "m2"}'::jsonb
WHERE type = 'terrain' 
AND (autres_details IS NULL OR NOT autres_details ? 'surface_unit');