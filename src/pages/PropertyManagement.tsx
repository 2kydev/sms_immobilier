import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, MapPin, Building, Calendar, User, Phone, Mail, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import PropertyDetailsDialog from '@/components/property/PropertyDetailsDialog';
import PropertyFormSimple from '@/components/property/PropertyFormSimple';

interface Property {
  id: string;
  titre: string;
  type: string;
  surface: number;
  pieces: number;
  prix: number;
  charges?: number;
  adresse: string;
  quartier: string;
  city: string;
  statut: string;
  description: string;
  images: string[];
  agent: string;
  nom_proprietaire?: string;
  contacts_proprietaire?: string;
  created_at: string;
  transaction_type: 'vente' | 'location';
}

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [filterTransaction, setFilterTransaction] = useState<string>('tous');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Statistiques
  const stats = {
    total: properties.length,
    disponible: properties.filter(p => p.statut === 'disponible').length,
    vendu: properties.filter(p => p.statut === 'vendu').length,
    loue: properties.filter(p => p.statut === 'loue').length,
    totalValue: properties.reduce((sum, p) => sum + p.prix, 0)
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformer les données pour correspondre au type Property
      const transformedData = (data || []).map(item => ({
        ...item,
        transaction_type: item.transaction_type as 'vente' | 'location'
      }));
      
      setProperties(transformedData);
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
    fetchProperties();
  }, []);

  // Filtrage des propriétés
  useEffect(() => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.nom_proprietaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.agent.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'tous') {
      filtered = filtered.filter(property => property.type === filterType);
    }

    if (filterStatus !== 'tous') {
      filtered = filtered.filter(property => property.statut === filterStatus);
    }

    if (filterTransaction !== 'tous') {
      filtered = filtered.filter(property => property.transaction_type === filterTransaction);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, filterType, filterStatus, filterTransaction]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge>;
      case 'sous-offre':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Sous offre</Badge>;
      case 'vendu':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vendu</Badge>;
      case 'loue':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Loué</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appartement': return '🏢';
      case 'maison': return '🏠';
      case 'terrain': return '🏞️';
      case 'immeuble': return '🏬';
      case 'entrepot': return '🏭';
      case 'bureau': return '🏢';
      case 'commerce': return '🏪';
      default: return '🏠';
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Propriété supprimée avec succès"
      });
      
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la propriété",
        variant: "destructive"
      });
    }
    setPropertyToDelete(null);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    // Rafraîchir la liste des propriétés après ajout
    fetchProperties();
  };

  const openPropertyDetails = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return <div className="p-6">Chargement des propriétés...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Biens Immobiliers</h1>
          <p className="text-muted-foreground mt-1">Gérez votre portefeuille immobilier</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un Bien
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{stats.disponible}</div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{stats.vendu}</div>
                <p className="text-sm text-muted-foreground">Vendus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{stats.loue}</div>
                <p className="text-sm text-muted-foreground">Loués</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <div className="text-lg font-bold">{stats.totalValue.toLocaleString()} F</div>
                <p className="text-sm text-muted-foreground">Valeur totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, adresse, propriétaire, agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Type de bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="appartement">Appartement</SelectItem>
                <SelectItem value="maison">Maison</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="immeuble">Immeuble</SelectItem>
                <SelectItem value="entrepot">Entrepôt</SelectItem>
                <SelectItem value="bureau">Bureau</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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
            <Select value={filterTransaction} onValueChange={setFilterTransaction}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="vente">Vente</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des propriétés */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des biens ({filteredProperties.length})</CardTitle>
          <CardDescription>
            Gérez l'ensemble de votre portefeuille immobilier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Titre / Référence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="w-16 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.titre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{getTypeIcon(property.type)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{property.titre}</div>
                      <div className="text-sm text-muted-foreground">#{property.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(property.type)}</span>
                        <span className="capitalize">{property.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{property.nom_proprietaire || 'Non renseigné'}</div>
                        {property.contacts_proprietaire && (
                          <div className="text-muted-foreground text-xs">{property.contacts_proprietaire}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <div>
                          <div>{property.city}</div>
                          <div className="text-muted-foreground text-xs">{property.quartier}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{property.surface} m²</span>
                      {property.pieces > 0 && (
                        <div className="text-xs text-muted-foreground">{property.pieces} pièces</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{property.prix.toLocaleString()} F</div>
                      <div className="text-xs text-muted-foreground capitalize">{property.transaction_type}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(property.statut)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        {property.agent}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(property.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPropertyDetails(property.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPropertyDetails(property.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setPropertyToDelete(property.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredProperties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune propriété trouvée avec ces critères
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour ajouter un bien */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau bien</DialogTitle>
            <DialogDescription>
              Renseignez les informations du bien immobilier
            </DialogDescription>
          </DialogHeader>
          <PropertyFormSimple onBack={handleFormClose} />
        </DialogContent>
      </Dialog>

      {/* Dialog des détails */}
      {selectedPropertyId && (
        <PropertyDetailsDialog
          propertyId={selectedPropertyId}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onUpdated={fetchProperties}
        />
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={() => setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette propriété sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => propertyToDelete && handleDeleteProperty(propertyToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyManagement;