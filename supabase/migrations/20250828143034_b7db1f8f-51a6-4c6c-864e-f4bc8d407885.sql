-- Add source field to properties table to separate management and catalog properties
ALTER TABLE public.properties 
ADD COLUMN source text NOT NULL DEFAULT 'management';

-- Add check constraint to ensure valid source values
ALTER TABLE public.properties 
ADD CONSTRAINT check_properties_source 
CHECK (source IN ('management', 'catalog'));

-- Create index for better filtering performance
CREATE INDEX idx_properties_source ON public.properties(source);

-- Update existing properties to be management properties by default
-- (this keeps current behavior for existing data)
UPDATE public.properties SET source = 'management' WHERE source IS NULL;