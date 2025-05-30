
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';
import PropertyImageGallery from './PropertyImageGallery';

interface Property {
  id: string;
  titre: string;
  type: 'appartement' | 'maison' | 'studio' | 'terrain' | 'local';
  surface: number;
  pieces: number;
  prix: number;
  charges?: number;
  adresse: string;
  quartier: string;
  city: string;
  statut: 'disponible' | 'sous-offre' | 'vendu' | 'loue';
  description: string;
  caracteristiques: string[];
  images: string[];
  agent: string;
}

interface Agent {
  id: string;
  nom: string;
  statut: 'actif' | 'inactif';
}

const PropertyManager = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<Property>({
    defaultValues: {
      titre: '',
      type: 'appartement',
      surface: 0,
      pieces: 0,
      prix: 0,
      adresse: '',
      quartier: '',
      city: '',
      statut: 'disponible',
      description: '',
      caracteristiques: [],
      images: [],
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
      
      // Transformer les données pour s'assurer que le statut est du bon type
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

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties((data || []) as Property[]);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les propriétés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = `${property.titre} ${property.adresse} ${property.quartier} ${property.city}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'tous' || property.type === filterType;
    const matchesStatut = filterStatut === 'tous' || property.statut === filterStatut;
    return matchesSearch && matchesType && matchesStatut;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'sous-offre': return 'bg-orange-100 text-orange-800';
      case 'vendu': return 'bg-red-100 text-red-800';
      case 'loue': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appartement': return '🏢';
      case 'maison': return '🏠';
      case 'studio': return '🏠';
      case 'terrain': return '🏞️';
      case 'local': return '🏪';
      default: return '🏠';
    }
  };

  const openPropertyDialog = (property?: Property) => {
    if (property) {
      setSelectedProperty(property);
      form.reset(property);
    } else {
      setSelectedProperty(null);
      // Set default agent to first available agent if exists
      const defaultAgent = agents.length > 0 ? agents[0].nom : '';
      form.reset({
        titre: '',
        type: 'appartement',
        surface: 0,
        pieces: 0,
        prix: 0,
        adresse: '',
        quartier: '',
        city: '',
        statut: 'disponible',
        description: '',
        caracteristiques: [],
        images: [],
        agent: defaultAgent
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: Property) => {
    try {
      const propertyData = {
        ...data,
        caracteristiques: data.caracteristiques || [],
        images: data.images || [],
        charges: data.charges || null
      };

      if (selectedProperty) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', selectedProperty.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Propriété mise à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Propriété créée avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la propriété",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des propriétés...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gestion des Propriétés</h1>
        <Button onClick={() => openPropertyDialog()} className="bg-primary hover:bg-primary/90">
          Nouvelle Propriété
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une propriété (titre, adresse, quartier, ville)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Type de bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="appartement">Appartements</SelectItem>
                <SelectItem value="maison">Maisons</SelectItem>
                <SelectItem value="studio">Studios</SelectItem>
                <SelectItem value="terrain">Terrains</SelectItem>
                <SelectItem value="local">Locaux commerciaux</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="sous-offre">Sous offre</SelectItem>
                <SelectItem value="vendu">Vendu</SelectItem>
                <SelectItem value="loue">Loué</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{properties.filter(p => p.statut === 'disponible').length}</div>
            <p className="text-sm text-gray-600">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{properties.filter(p => p.statut === 'sous-offre').length}</div>
            <p className="text-sm text-gray-600">Sous offre</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{properties.filter(p => p.statut === 'vendu').length}</div>
            <p className="text-sm text-gray-600">Vendus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {properties.reduce((sum, p) => sum + p.prix, 0).toLocaleString()} FCFA
            </div>
            <p className="text-sm text-gray-600">Valeur totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des propriétés avec nouvelle galerie d'images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="card-hover cursor-pointer" onClick={() => openPropertyDialog(property)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(property.type)}</span>
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{property.titre}</CardTitle>
                    <CardDescription>{property.city} - {property.quartier}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatutColor(property.statut)}>
                  {property.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Nouvelle galerie d'images */}
                <PropertyImageGallery
                  images={property.images || []}
                  propertyTitle={property.titre}
                />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Surface:</span> {property.surface}m²
                  </div>
                  <div>
                    <span className="font-medium">Pièces:</span> {property.pieces}
                  </div>
                </div>
                
                <div className="text-lg font-bold text-primary">
                  {property.prix.toLocaleString()} FCFA
                  {property.charges && (
                    <span className="text-sm font-normal text-gray-600"> + {property.charges} FCFA/mois</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>

                <div className="flex flex-wrap gap-1">
                  {property.caracteristiques.slice(0, 3).map((carac, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {carac}
                    </Badge>
                  ))}
                  {property.caracteristiques.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.caracteristiques.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Agent: {property.agent}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour créer/éditer une propriété */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProperty ? 'Modifier la propriété' : 'Nouvelle propriété'}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations de la propriété
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titre"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de bien</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="appartement">Appartement</SelectItem>
                        <SelectItem value="maison">Maison</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                        <SelectItem value="local">Local commercial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="sous-offre">Sous offre</SelectItem>
                        <SelectItem value="vendu">Vendu</SelectItem>
                        <SelectItem value="loue">Loué</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surface"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charges mensuelles (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value) || undefined)} />
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
                name="adresse"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Adresse complète</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent responsable</FormLabel>
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
                      <Textarea placeholder="Description détaillée de la propriété..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <ImageUpload
                  images={form.watch('images') || []}
                  onImagesChange={(images) => form.setValue('images', images)}
                  maxImages={5}
                />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {selectedProperty ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManager;
