
-- Ajouter les nouveaux champs à la table properties
ALTER TABLE public.properties 
ADD COLUMN nom_proprietaire TEXT,
ADD COLUMN contacts_proprietaire TEXT;

-- Mettre à jour les types de propriété existants pour inclure "Immeuble"
-- (Pas de contrainte CHECK nécessaire car c'est géré côté application)
