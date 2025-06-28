
-- Ajouter les nouveaux champs ACD et ADU à la table properties
ALTER TABLE public.properties 
ADD COLUMN acd BOOLEAN DEFAULT false,
ADD COLUMN adu BOOLEAN DEFAULT false;

-- Créer un bucket de stockage pour les fichiers des propriétés
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-files', 'property-files', true);

-- Créer les politiques RLS pour le bucket property-files
CREATE POLICY "Anyone can upload property files" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'property-files');

CREATE POLICY "Anyone can view property files" ON storage.objects 
FOR SELECT USING (bucket_id = 'property-files');

CREATE POLICY "Anyone can update property files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'property-files');

CREATE POLICY "Anyone can delete property files" ON storage.objects 
FOR DELETE USING (bucket_id = 'property-files');
