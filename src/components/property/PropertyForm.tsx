import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAction } from '@/services/auditService';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import FileUpload from '@/components/FileUpload';

interface PropertyForSale {
  titre: string;
  type: 'appartement' | 'maison' | 'studio' | 'terrain' | 'local' | 'immeuble' | 'triplexe' | 'duplexe';
  transaction_type: 'vente' | 'location';
  extrait_topographique?: string;
  prix: number;
  surface: number;
  pieces: number;
  nombre_salles_eau?: number;
  jardin: boolean;
  piscine: boolean;
  cuisine_independante: boolean;
  acd: boolean;
  adu: boolean;
  nom_proprietaire?: string;
  contacts_proprietaire?: string;
  autres_details?: string;
  adresse: string;
  quartier: string;
  city: string;
  description: string;
  agent: string;
}

interface Agent {
  id: string;
  nom: string;
  statut: 'actif' | 'inactif';
}

interface PropertyFormProps {
  onBack: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onBack }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [extractFiles, setExtractFiles] = useState<string[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<PropertyForSale>({
    defaultValues: {
      titre: '',
      type: 'appartement',
      transaction_type: 'vente',
      extrait_topographique: '',
      prix: 0,
      surface: 0,
      pieces: 0,
      nombre_salles_eau: 0,
      jardin: false,
      piscine: false,
      cuisine_independante: false,
      acd: false,
      adu: false,
      nom_proprietaire: '',
      contacts_proprietaire: '',
      autres_details: '',
      adresse: '',
      quartier: '',
      city: '',
      description: '',
      agent: ''
    }
  });

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, nom, statut')
        .eq('statut', 'actif')
        .order('nom', { ascending: true });

      if (error) throw error;
      
      const transformedData = (data || []).map(agent => ({
        ...agent,
        statut: agent.statut as 'actif' | 'inactif'
      }));
      
      setAgents(transformedData);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const onSubmit = async (data: PropertyForSale) => {
    setLoading(true);
    
    try {
      console.log('Form data being submitted:', data);
      
      // Validation des champs obligatoires
      if (!data.titre.trim()) {
        throw new Error('Le titre est obligatoire');
      }
      if (!data.prix || data.prix <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }
      if (!data.surface || data.surface <= 0) {
        throw new Error('La superficie doit être supérieure à 0');
      }
      if (!data.city.trim()) {
        throw new Error('La ville est obligatoire');
      }
      if (!data.agent.trim()) {
        throw new Error('L\'agent est obligatoire');
      }

      // Combiner tous les fichiers
      const allFiles = [...extractFiles, ...additionalFiles];

      const propertyData = {
        titre: data.titre.trim(),
        type: data.type,
        transaction_type: data.transaction_type,
        extrait_topographique: extractFiles.length > 0 ? extractFiles[0] : null,
        prix: data.prix,
        surface: data.surface,
        pieces: data.pieces,
        nombre_salles_eau: data.nombre_salles_eau || null,
        jardin: data.jardin,
        piscine: data.piscine,
        cuisine_independante: data.cuisine_independante,
        acd: data.acd,
        adu: data.adu,
        nom_proprietaire: data.nom_proprietaire?.trim() || null,
        contacts_proprietaire: data.contacts_proprietaire?.trim() || null,
        autres_details: data.autres_details?.trim() || null,
        adresse: data.adresse.trim(),
        quartier: data.quartier.trim(),
        city: data.city.trim(),
        description: data.description.trim(),
        agent: data.agent.trim(),
        statut: 'disponible',
        caracteristiques: allFiles,
        images: images
      };

      console.log('Property data to be inserted:', propertyData);

      // Test de la connexion à Supabase d'abord
      const { data: testData, error: testError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error('Problème de connexion à la base de données');
      }

      console.log('Supabase connection test successful');

      const { data: inserted, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      if (inserted) logAction({ action: 'create', table: 'properties', recordId: inserted.id, label: propertyData.titre });

      toast({
        title: "Succès",
        description: "Bien immobilier enregistré avec succès"
      });

      // Reset du formulaire et retour à la vue principale
      form.reset();
      setImages([]);
      setExtractFiles([]);
      setAdditionalFiles([]);
      onBack();
      
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer le bien immobilier",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-primary">Nouveau bien immobilier</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Enregistrement d'un nouveau bien immobilier</CardTitle>
          <CardDescription>
            Renseignez les informations du bien immobilier à mettre en vente ou en location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="titre"
                rules={{ required: "Le titre est obligatoire" }}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Titre du bien *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Bel appartement au centre-ville" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transaction_type"
                rules={{ required: "Le type de transaction est obligatoire" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de transaction *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vente">À vendre</SelectItem>
                        <SelectItem value="location">À louer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                rules={{ required: "Le type de propriété est obligatoire" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de propriété *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="appartement">Appartement</SelectItem>
                        <SelectItem value="maison">Maison</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                        <SelectItem value="local">Local commercial</SelectItem>
                        <SelectItem value="immeuble">Immeuble</SelectItem>
                        <SelectItem value="duplexe">Duplexe</SelectItem>
                        <SelectItem value="triplexe">Triplexe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prix"
                rules={{ 
                  required: "Le prix est obligatoire",
                  min: { value: 1, message: "Le prix doit être supérieur à 0" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (FCFA) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surface"
                rules={{ 
                  required: "La superficie est obligatoire",
                  min: { value: 1, message: "La superficie doit être supérieure à 0" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Superficie (m² ou ha) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pieces"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de pièces</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombre_salles_eau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de salles d'eau / salles de bain</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nom_proprietaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du propriétaire</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom complet du propriétaire" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contacts_proprietaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacts du propriétaire</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Téléphone, email, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Label className="text-base font-medium">Détails additionnels</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="jardin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Jardin</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="piscine"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Piscine</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cuisine_independante"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Cuisine indépendante</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acd"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>ACD</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adu"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>ADU</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="autres_details"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Autres détails</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Décrivez d'autres détails spécifiques..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                rules={{ required: "La ville est obligatoire" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Entrez la ville" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quartier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quartier</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Entrez le quartier" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Adresse complète</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Adresse détaillée du bien" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agent"
                rules={{ required: "L'agent responsable est obligatoire" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent responsable *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.nom}>
                            {agent.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Description détaillée du bien immobilier..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload des images */}
              <div className="md:col-span-2">
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={10}
                />
              </div>

              {/* Upload de l'extrait topographique */}
              <div className="md:col-span-2">
                <FileUpload
                  files={extractFiles}
                  onFilesChange={setExtractFiles}
                  maxFiles={1}
                  acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                  label="Extrait topographique"
                  description="Téléchargez l'extrait topographique du bien"
                />
              </div>

              {/* Upload des documents complémentaires */}
              <div className="md:col-span-2">
                <FileUpload
                  files={additionalFiles}
                  onFilesChange={setAdditionalFiles}
                  maxFiles={5}
                  acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
                  label="Documents complémentaires"
                  description="Plans, documents juridiques, etc."
                />
              </div>

              <div className="md:col-span-2 flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer le bien'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                  disabled={loading}
                >
                  Réinitialiser
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyForm;
