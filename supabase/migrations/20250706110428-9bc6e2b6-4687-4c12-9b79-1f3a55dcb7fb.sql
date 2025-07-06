-- Add transaction_type column to properties table
ALTER TABLE public.properties 
ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'vente';

-- Update the property type constraint to include all valid types
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_type_check 
CHECK (type IN ('appartement', 'maison', 'studio', 'terrain', 'local', 'immeuble', 'duplexe', 'triplexe'));

-- Add constraint for transaction type
ALTER TABLE public.properties 
ADD CONSTRAINT properties_transaction_type_check 
CHECK (transaction_type IN ('vente', 'location'));