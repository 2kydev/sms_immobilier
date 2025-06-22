
-- Ajouter les nouvelles colonnes nécessaires à la table properties
ALTER TABLE public.properties 
ADD COLUMN extrait_topographique text,
ADD COLUMN nombre_salles_eau integer,
ADD COLUMN jardin boolean DEFAULT false,
ADD COLUMN piscine boolean DEFAULT false,
ADD COLUMN cuisine_independante boolean DEFAULT false,
ADD COLUMN autres_details text;

-- Mettre à jour la colonne surface pour supporter les décimales (pour les hectares)
ALTER TABLE public.properties 
ALTER COLUMN surface TYPE decimal(10,2);
