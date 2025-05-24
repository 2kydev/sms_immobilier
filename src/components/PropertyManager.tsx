
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Property {
  id: number;
  titre: string;
  type: 'appartement' | 'maison' | 'studio' | 'terrain' | 'local';
  surface: number;
  pieces: number;
  prix: number;
  charges?: number;
  adresse: string;
  quartier: string;
  statut: 'disponible' | 'sous-offre' | 'vendu' | 'loue';
  description: string;
  caracteristiques: string[];
  images: string[];
  dateAjout: string;
  agent: string;
}

const PropertyManager = () => {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 1,
      titre: 'Magnifique appartement 3 pièces avec balcon',
      type: 'appartement',
      surface: 75,
      pieces: 3,
      prix: 425000,
      charges: 150,
      adresse: '12 rue de la République, 75011 Paris',
      quartier: 'République',
      statut: 'disponible',
      description: 'Superbe appartement situé au 3ème étage avec ascenseur, entièrement rénové, cuisine équipée, balcon avec vue dégagée.',
      caracteristiques: ['Ascenseur', 'Balcon', 'Cuisine équipée', 'Cave', 'Double vitrage'],
      images: ['/placeholder.svg'],
      dateAjout: '2024-05-15',
      agent: 'Marie Dupont'
    },
    {
      id: 2,
      titre: 'Maison familiale avec jardin',
      type: 'maison',
      surface: 120,
      pieces: 5,
      prix: 650000,
      adresse: '45 avenue des Tilleuls, 92160 Antony',
      quartier: 'Centre-ville Antony',
      statut: 'sous-offre',
      description: 'Belle maison familiale avec jardin de 200m², garage, cave et combles aménageables.',
      caracteristiques: ['Jardin', 'Garage', 'Cave', 'Combles', 'Cheminée'],
      images: ['/placeholder.svg'],
      dateAjout: '2024-05-10',
      agent: 'Pierre Leroy'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = `${property.titre} ${property.adresse} ${property.quartier}`.toLowerCase().includes(searchTerm.toLowerCase());
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
    setSelectedProperty(property || {
      id: 0,
      titre: '',
      type: 'appartement',
      surface: 0,
      pieces: 0,
      prix: 0,
      adresse: '',
      quartier: '',
      statut: 'disponible',
      description: '',
      caracteristiques: [],
      images: [],
      dateAjout: new Date().toISOString().split('T')[0],
      agent: 'Marie Dupont'
    });
    setIsDialogOpen(true);
  };

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
                placeholder="Rechercher une propriété (titre, adresse, quartier)..."
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
              {properties.reduce((sum, p) => sum + p.prix, 0).toLocaleString()}€
            </div>
            <p className="text-sm text-gray-600">Valeur totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des propriétés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="card-hover cursor-pointer" onClick={() => openPropertyDialog(property)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(property.type)}</span>
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{property.titre}</CardTitle>
                    <CardDescription>{property.quartier}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatutColor(property.statut)}>
                  {property.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Surface:</span> {property.surface}m²
                  </div>
                  <div>
                    <span className="font-medium">Pièces:</span> {property.pieces}
                  </div>
                </div>
                
                <div className="text-lg font-bold text-primary">
                  {property.prix.toLocaleString()}€
                  {property.charges && (
                    <span className="text-sm font-normal text-gray-600"> + {property.charges}€/mois</span>
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
                  <span>{new Date(property.dateAjout).toLocaleDateString('fr-FR')}</span>
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
              {selectedProperty?.id ? 'Modifier la propriété' : 'Nouvelle propriété'}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations de la propriété
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titre">Titre</Label>
                <Input id="titre" defaultValue={selectedProperty.titre} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de bien</Label>
                <Select defaultValue={selectedProperty.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appartement">Appartement</SelectItem>
                    <SelectItem value="maison">Maison</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="local">Local commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select defaultValue={selectedProperty.statut}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="sous-offre">Sous offre</SelectItem>
                    <SelectItem value="vendu">Vendu</SelectItem>
                    <SelectItem value="loue">Loué</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surface">Surface (m²)</Label>
                <Input id="surface" type="number" defaultValue={selectedProperty.surface} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pieces">Nombre de pièces</Label>
                <Input id="pieces" type="number" defaultValue={selectedProperty.pieces} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prix">Prix (€)</Label>
                <Input id="prix" type="number" defaultValue={selectedProperty.prix} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="charges">Charges mensuelles (€)</Label>
                <Input id="charges" type="number" defaultValue={selectedProperty.charges} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adresse">Adresse complète</Label>
                <Input id="adresse" defaultValue={selectedProperty.adresse} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Input id="quartier" defaultValue={selectedProperty.quartier} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent">Agent responsable</Label>
                <Select defaultValue={selectedProperty.agent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marie Dupont">Marie Dupont</SelectItem>
                    <SelectItem value="Pierre Leroy">Pierre Leroy</SelectItem>
                    <SelectItem value="Sophie Martin">Sophie Martin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Description détaillée de la propriété..." defaultValue={selectedProperty.description} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="caracteristiques">Caractéristiques</Label>
                <Input id="caracteristiques" placeholder="Séparez par des virgules (ex: Ascenseur, Balcon, Parking...)" defaultValue={selectedProperty.caracteristiques.join(', ')} />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  {selectedProperty.id ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManager;
