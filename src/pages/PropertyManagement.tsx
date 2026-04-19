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
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, MapPin, Building, Calendar, User, Phone, Mail, TrendingUp, Archive, FileDown } from 'lucide-react';
import { printPropertySheet } from '@/components/property/PropertyPrintSheet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAction } from '@/services/auditService';
import { useRole } from '@/hooks/useRole';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import PropertyDetailsDialog from '@/components/property/PropertyDetailsDialog';
import PropertyFormSimple from '@/components/property/PropertyFormSimple';
import PaginationControls from '@/components/ui/PaginationControls';
import { usePagination } from '@/hooks/usePagination';
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
  autres_details?: string | null;
}
const PAGE_SIZE = 20;

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [filterTransaction, setFilterTransaction] = useState<string>('tous');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsInitialEditing, setDetailsInitialEditing] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasAnyRole } = useRole();
  const pagination = usePagination(PAGE_SIZE);

  const fetchProperties = async (forcePage = pagination.page) => {
    setLoading(true);
    const from = (forcePage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      let query = supabase.from('properties').select('*', { count: 'exact' });
      if (searchTerm) {
        query = query.or(
          `titre.ilike.%${searchTerm}%,adresse.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,quartier.ilike.%${searchTerm}%,nom_proprietaire.ilike.%${searchTerm}%,agent.ilike.%${searchTerm}%`
        );
      }
      if (filterType !== 'tous') query = query.eq('type', filterType);
      if (filterStatus !== 'tous') query = query.eq('statut', filterStatus);
      if (filterTransaction !== 'tous') query = query.eq('transaction_type', filterTransaction);

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      pagination.setTotalCount(count ?? 0);
      setProperties((data || []).map(item => ({
        ...item,
        transaction_type: item.transaction_type as 'vente' | 'location'
      })));
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

  // Re-fetch when page changes
  useEffect(() => {
    fetchProperties();
  }, [pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  // When filters change: reset to page 1 (triggers page effect above) or fetch directly if already on page 1
  useEffect(() => {
    if (pagination.page === 1) {
      fetchProperties(1);
    } else {
      pagination.setPage(1);
    }
  }, [searchTerm, filterType, filterStatus, filterTransaction]); // eslint-disable-line react-hooks/exhaustive-deps
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
      case 'archivé':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archivé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appartement':
        return '🏢';
      case 'maison':
        return '🏠';
      case 'terrain':
        return '🏞️';
      case 'immeuble':
        return '🏬';
      case 'entrepot':
        return '🏭';
      case 'bureau':
        return '🏢';
      case 'commerce':
        return '🏪';
      default:
        return '🏠';
    }
  };

  // Smart display function for surface with unit
  const formatSurface = (surface: number, autresDetails: string | null) => {
    if (!surface) return "—";
    try {
      const details = autresDetails ? JSON.parse(autresDetails) : {};
      const unit = details.surface_unit || "m2"; // Default to m2 for existing properties
      
      if (unit === "ha") {
        // Convert back to hectares for display
        const hectares = surface / 10000;
        return `${hectares.toLocaleString()} ha`;
      }
      return `${surface.toLocaleString()} m²`;
    } catch (error) {
      // Fallback if JSON parsing fails
      return `${surface.toLocaleString()} m²`;
    }
  };
  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const label = properties.find(p => p.id === propertyId)?.titre ?? propertyId;
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
      if (error) throw error;
      logAction({ action: 'delete', table: 'properties', recordId: propertyId, label });

      toast({
        title: "Bien supprimé",
        description: "Le bien a été supprimé avec succès. Les transactions associées ont été conservées."
      });
      
      fetchProperties();
    } catch (error: any) {
      console.error('Error deleting property:', error);
      
      // Check if it's a permission error
      if (error.message?.includes('permission') || error.message?.includes('policy') || error.code === '42501') {
        toast({
          title: "Autorisation refusée",
          description: "Vous n'avez pas les droits pour supprimer ce bien (réservé aux Admin/DG)",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le bien",
          variant: "destructive"
        });
      }
    }
    setPropertyToDelete(null);
  };

  const handleArchiveProperty = async (propertyId: string) => {
    try {
      const label = properties.find(p => p.id === propertyId)?.titre ?? propertyId;
      const { error } = await supabase
        .from('properties')
        .update({ statut: 'archivé' })
        .eq('id', propertyId);

      if (error) throw error;
      logAction({ action: 'update', table: 'properties', recordId: propertyId, label: `[archivé] ${label}` });

      toast({
        title: "Succès",
        description: "Propriété archivée avec succès"
      });
      fetchProperties();
    } catch (error) {
      console.error('Error archiving property:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la propriété",
        variant: "destructive"
      });
    }
  };
  const handleFormClose = () => {
    setShowAddForm(false);
    // Rafraîchir la liste des propriétés après ajout
    fetchProperties();
  };
  const openPropertyDetails = (propertyId: string) => {
    setDetailsInitialEditing(false);
    setSelectedPropertyId(propertyId);
    setShowDetailsDialog(true);
  };

  const openPropertyEdit = (propertyId: string) => {
    setDetailsInitialEditing(true);
    setSelectedPropertyId(propertyId);
    setShowDetailsDialog(true);
  };
  if (loading) {
    return <div className="p-6">Chargement des propriétés...</div>;
  }
  return <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Gestion des Biens Immobiliers</h1>
          <p className="text-muted-foreground mt-1">Gérez votre portefeuille immobilier</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Ajouter un Bien
        </Button>
      </div>


      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par titre, adresse, propriétaire, agent..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
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
                <SelectItem value="archivé">Archivé</SelectItem>
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
          <CardTitle>Liste des biens ({pagination.totalCount})</CardTitle>
          <CardDescription>
            Gérez l'ensemble de votre portefeuille immobilier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Photo</TableHead>
                  <TableHead>Titre / Référence</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Propriétaire</TableHead>
                  <TableHead className="hidden sm:table-cell">Localisation</TableHead>
                  <TableHead className="hidden md:table-cell">Superficie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">Agent</TableHead>
                  <TableHead className="hidden lg:table-cell">Date d'ajout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map(property => <TableRow key={property.id} className="hover:bg-muted/50">
                    <TableCell className="hidden sm:table-cell">
                      <div className="w-16 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {property.images && property.images.length > 0 ? <img src={property.images[0]} alt={property.titre} className="w-full h-full object-cover" /> : <span className="text-2xl">{getTypeIcon(property.type)}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{property.titre}</div>
                      <div className="text-sm text-muted-foreground">#{property.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(property.type)}</span>
                        <span className="capitalize">{property.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">
                        <div className="font-medium">{property.nom_proprietaire || 'Non renseigné'}</div>
                        {property.contacts_proprietaire && <div className="text-muted-foreground text-xs">{property.contacts_proprietaire}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <div>
                          <div>{property.city}</div>
                          <div className="text-muted-foreground text-xs">{property.quartier}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-medium">{formatSurface(property.surface, property.autres_details || null)}</span>
                      {property.pieces > 0 && <div className="text-xs text-muted-foreground">{property.pieces} pièces</div>}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{property.prix.toLocaleString()} F</div>
                      <div className="text-xs text-muted-foreground capitalize">{property.transaction_type}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(property.statut)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        {property.agent}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
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
                          <DropdownMenuItem onClick={() => openPropertyEdit(property.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => printPropertySheet(property)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Fiche PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleArchiveProperty(property.id)} className="text-orange-600">
                            <Archive className="h-4 w-4 mr-2" />
                            Archiver
                          </DropdownMenuItem>
                          {hasAnyRole(['admin', 'dg']) && (
                            <DropdownMenuItem onClick={() => setPropertyToDelete(property.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
            
            {properties.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune propriété trouvée avec ces critères
              </div>
            )}
          </div>

          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={pagination.setPage}
          />
        </CardContent>
      </Card>

      {/* Dialog pour ajouter un bien */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
      {selectedPropertyId && <PropertyDetailsDialog propertyId={selectedPropertyId} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} onUpdated={fetchProperties} initialEditing={detailsInitialEditing} />}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={() => setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette propriété sera définitivement supprimée, mais les transactions associées seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => propertyToDelete && handleDeleteProperty(propertyToDelete)} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default PropertyManagement;