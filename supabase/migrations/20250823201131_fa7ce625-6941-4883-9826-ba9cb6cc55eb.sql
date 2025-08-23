-- Ajouter les nouveaux champs pour les documents légaux
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS attestation_villagoise boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS autres_documents boolean DEFAULT false;