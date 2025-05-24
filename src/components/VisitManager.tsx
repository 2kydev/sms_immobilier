import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VisitStatusSelect from './VisitStatusSelect';

interface Visit {
  id: string;
  client_id?: string;
  property_id?: string;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  propriete_titre: string;
  propriete_adresse: string;
  date: string;
  heure: string;
  statut: 'planifiee' | 'realisee' | 'annulee' | 'reportee';
  agent: string;
  notes?: string;
  feedback_client?: string;
  note_visite?: number;
}

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

interface Property {
  id: string;
  titre: string;
  type: string;
  surface: number;
  pieces: number;
  prix: number;
  city: string;
  quartier: string;
}

const VisitManager = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<Visit>({
    defaultValues: {
      client_nom: '',
      client_prenom: '',
      client_telephone: '',
      propriete_titre: '',
      propriete_adresse: '',
      date: new Date().toISOString().split('T')[0],
      heure: '09:00',
      statut: 'planifiee',
      agent: 'Marie Dupont',
      notes: ''
    }
  });

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('date', { ascending: true })
        .order('heure', { ascending: true });

      if (error) throw error;
      setVisits((data || []) as Visit[]);
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les visites",
        variant: "destructive"
      });
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, telephone')
        .order('nom', { ascending: true });

      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, titre, type, surface, pieces, prix, city, quartier')
        .eq('statut', 'disponible')
        .order('titre', { ascending: true });

      if (error) throw error;
      setProperties((data || []) as Property[]);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
    fetchClients();
    fetchProperties();
  }, []);

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = `${visit.client_prenom} ${visit.client_nom} ${visit.propriete_titre}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'tous' || visit.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'bg-blue-100 text-blue-800';
      case 'realisee': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      case 'reportee': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (visitId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ statut: newStatus })
        .eq('id', visitId);

      if (error) throw error;

      // Mettre à jour l'état local
      setVisits(visits.map(visit => 
        visit.id === visitId ? { ...visit, statut: newStatus as any } : visit
      ));

      toast({
        title: "Succès",
        description: "Statut de la visite mis à jour"
      });

      // Programmer l'email de notification si c'est une visite planifiée
      if (newStatus === 'planifiee') {
        const visit = visits.find(v => v.id === visitId);
        if (visit) {
          await scheduleVisitNotification(visit);
        }
      }
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const scheduleVisitNotification = async (visit: Visit) => {
    try {
      const { error } = await supabase.functions.invoke('schedule-visit-notification', {
        body: {
          visitId: visit.id,
          agentEmail: getAgentEmail(visit.agent),
          visitDate: visit.date,
          visitTime: visit.heure,
          clientName: `${visit.client_prenom} ${visit.client_nom}`,
          clientPhone: visit.client_telephone,
          propertyTitle: visit.propriete_titre,
          propertyAddress: visit.propriete_adresse
        }
      });

      if (error) throw error;

      toast({
        title: "Notification programmée",
        description: "Un email de rappel sera envoyé 24h avant la visite"
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: "Attention",
        description: "La visite a été créée mais la notification email n'a pas pu être programmée",
        variant: "destructive"
      });
    }
  };

  const getAgentEmail = (agentName: string) => {
    const emailMap: { [key: string]: string } = {
      'Marie Dupont': 'marie.dupont@agence.com',
      'Pierre Leroy': 'pierre.leroy@agence.com',
      'Sophie Martin': 'sophie.martin@agence.com'
    };
    return emailMap[agentName] || 'contact@agence.com';
  };

  const openVisitDialog = (visit?: Visit) => {
    if (visit) {
      setSelectedVisit(visit);
      form.reset(visit);
    } else {
      setSelectedVisit(null);
      form.reset({
        client_nom: '',
        client_prenom: '',
        client_telephone: '',
        propriete_titre: '',
        propriete_adresse: '',
        date: new Date().toISOString().split('T')[0],
        heure: '09:00',
        statut: 'planifiee',
        agent: 'Marie Dupont',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      form.setValue('client_nom', selectedClient.nom);
      form.setValue('client_prenom', selectedClient.prenom);
      form.setValue('client_telephone', selectedClient.telephone);
      form.setValue('client_id', clientId);
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = properties.find(p => p.id === propertyId);
    if (selectedProperty) {
      form.setValue('propriete_titre', selectedProperty.titre);
      form.setValue('propriete_adresse', `${selectedProperty.city} - ${selectedProperty.quartier}`);
      form.setValue('property_id', propertyId);
    }
  };

  const formatPropertyOption = (property: Property) => {
    return `${property.type} - ${property.surface}m² - ${property.pieces} pièces - ${property.city}, ${property.quartier} - ${property.prix.toLocaleString()}FCFA`;
  };

  const onSubmit = async (data: Visit) => {
    try {
      const visitData = {
        ...data,
        feedback_client: data.feedback_client || null,
        note_visite: data.note_visite || null,
        client_id: data.client_id || null,
        property_id: data.property_id || null
      };

      if (selectedVisit) {
        const { error } = await supabase
          .from('visits')
          .update(visitData)
          .eq('id', selectedVisit.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Visite mise à jour avec succès"
        });
      } else {
        const { data: newVisit, error } = await supabase
          .from('visits')
          .insert([visitData])
          .select()
          .single();

        if (error) throw error;

        // Programmer la notification pour nouvelle visite
        if (visitData.statut === 'planifiee') {
          await scheduleVisitNotification(newVisit);
        }

        toast({
          title: "Succès",
          description: "Visite créée avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchVisits();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la visite",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des visites...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gestion des Visites</h1>
        <Button onClick={() => openVisitDialog()} className="bg-primary hover:bg-primary/90">
          Nouvelle Visite
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une visite (client, propriété)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="planifiee">Planifiée</SelectItem>
                <SelectItem value="realisee">Réalisée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
                <SelectItem value="reportee">Reportée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{visits.filter(v => v.statut === 'planifiee').length}</div>
            <p className="text-sm text-gray-600">Planifiées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{visits.filter(v => v.statut === 'realisee').length}</div>
            <p className="text-sm text-gray-600">Réalisées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{visits.filter(v => v.statut === 'annulee').length}</div>
            <p className="text-sm text-gray-600">Annulées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{visits.filter(v => v.statut === 'reportee').length}</div>
            <p className="text-sm text-gray-600">Reportées</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des visites avec sélecteur de statut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVisits.map((visit) => (
          <Card key={visit.id} className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {visit.client_prenom} {visit.client_nom}
                </CardTitle>
                <VisitStatusSelect
                  value={visit.statut}
                  onChange={(newStatus) => handleStatusChange(visit.id, newStatus)}
                />
              </div>
              <CardDescription>{visit.propriete_titre}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Date:</span> {new Date(visit.date).toLocaleDateString('fr-FR')}</p>
                <p><span className="font-medium">Heure:</span> {visit.heure}</p>
                <p><span className="font-medium">Téléphone:</span> {visit.client_telephone}</p>
                <p><span className="font-medium">Agent:</span> {visit.agent}</p>
                <p><span className="font-medium">Adresse:</span> {visit.propriete_adresse}</p>
                {visit.note_visite && (
                  <p><span className="font-medium">Note:</span> {visit.note_visite}/5</p>
                )}
                {visit.notes && (
                  <p className="text-gray-600 italic">"{visit.notes.substring(0, 50)}..."</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openVisitDialog(visit)}
                  className="w-full"
                >
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour créer/éditer une visite */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVisit ? 'Modifier la visite' : 'Nouvelle visite'}
            </DialogTitle>
            <DialogDescription>
              Programmez une visite avec un client
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélection du client */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={handleClientSelect} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.prenom} {client.nom} - {client.telephone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sélection de la propriété */}
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Propriété à visiter *</FormLabel>
                    <Select onValueChange={handlePropertySelect} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une propriété" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {formatPropertyOption(property)}
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
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
                        <SelectItem value="planifiee">Planifiée</SelectItem>
                        <SelectItem value="realisee">Réalisée</SelectItem>
                        <SelectItem value="annulee">Annulée</SelectItem>
                        <SelectItem value="reportee">Reportée</SelectItem>
                      </SelectContent>
                    </Select>
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
                          <SelectValue placeholder="Agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Marie Dupont">Marie Dupont</SelectItem>
                        <SelectItem value="Pierre Leroy">Pierre Leroy</SelectItem>
                        <SelectItem value="Sophie Martin">Sophie Martin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('statut') === 'realisee' && (
                <FormField
                  control={form.control}
                  name="note_visite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note de la visite (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes sur la visite..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('statut') === 'realisee' && (
                <FormField
                  control={form.control}
                  name="feedback_client"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Feedback du client</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Retour du client après la visite..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {selectedVisit ? 'Mettre à jour' : 'Créer'}
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

export default VisitManager;
