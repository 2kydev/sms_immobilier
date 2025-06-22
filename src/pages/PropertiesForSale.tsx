
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
import { Upload, Plus, ArrowLeft } from 'lucide-react';
import PropertyStats from '@/components/PropertyStats';

interface PropertyForSale {
  titre: string;
  type: 'appartement' | 'maison' | 'studio' | 'terrain' | 'local' | 'immeuble';
  extrait_topographique?: string;
  prix: number;
  surface: number;
  pieces: number;
  nombre_salles_eau?: number;
  jardin: boolean;
  piscine: boolean;
  cuisine_independante: boolean;
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

const PropertiesForSale = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<PropertyForSale>({
    defaultValues: {
      titre: '',
      type: 'appartement',
      extrait_topographique: '',
      prix: 0,
      surface: 0,
      pieces: 0,
      nombre_salles_eau: 0,
      jardin: false,
      piscine: false,
      cuisine_independante: false,
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

      const propertyData = {
        titre: data.titre.trim(),
        type: data.type,
        extrait_topographique: data.extrait_topographique?.trim() || null,
        prix: data.prix,
        surface: data.surface,
        pieces: data.pieces,
        nombre_salles_eau: data.nombre_salles_eau || null,
        jardin: data.jardin,
        piscine: data.piscine,
        cuisine_independante: data.cuisine_independante,
        nom_proprietaire: data.nom_proprietaire?.trim() || null,
        contacts_proprietaire: data.contacts_proprietaire?.trim() || null,
        autres_details: data.autres_details?.trim() || null,
        adresse: data.adresse.trim(),
        quartier: data.quartier.trim(),
        city: data.city.trim(),
        description: data.description.trim(),
        agent: data.agent.trim(),
        statut: 'disponible',
        caracteristiques: [],
        images: []
      };

      const { error } = await supabase
        .from('properties')
        .insert([propertyData]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Bien immobilier enregistré avec succès"
      });

      // Reset du formulaire et retour à la vue principale
      form.reset();
      setShowForm(false);
      
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Pour l'instant, on stocke juste le nom du fichier
      // Dans une implémentation complète, il faudrait uploader le fichier vers un service de stockage
      form.setValue('extrait_topographique', file.name);
      toast({
        title: "Fichier sélectionné",
        description: `Fichier "${file.name}" sélectionné`
      });
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
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
              Renseignez les informations du bien immobilier à mettre en vente
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="extrait_topographique"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extrait topographique</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            placeholder="Nom du fichier"
                            readOnly
                            className="flex-1"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <Button type="button" variant="outline" size="sm" className="flex items-center gap-1">
                              <Upload className="h-4 w-4" />
                              Parcourir
                            </Button>
                          </label>
                        </div>
                      </FormControl>
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
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Biens à vendre</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Ajouter un nouveau bien
        </Button>
      </div>

      <PropertyStats />

      <Card>
        <CardHeader>
          <CardTitle>Gestion des biens immobiliers</CardTitle>
          <CardDescription>
            Consultez les statistiques de vos biens et ajoutez de nouveaux biens à vendre
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Commencez par ajouter un bien
              </h3>
              <p className="text-gray-500 mb-4">
                Enregistrez vos premiers biens immobiliers pour commencer à les gérer efficacement.
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un bien immobilier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesForSale;
