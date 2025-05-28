import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, List, Mail, Clock } from 'lucide-react';
import VisitCalendar from './VisitCalendar';

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
  notification_enabled?: boolean;
  notification_delay_hours?: number;
  notification_email?: string;
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

interface Agent {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

const VisitManager = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
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
      agent: '',
      notes: '',
      notification_enabled: false,
      notification_delay_hours: 24,
      notification_email: ''
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
      setVisits((data || []).map(visit => ({
        ...visit,
        statut: visit.statut as 'planifiee' | 'realisee' | 'annulee' | 'reportee'
      })));
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
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('statut', 'actif')
        .order('nom', { ascending: true });

      if (error) throw error;
      setAgents((data || []) as Agent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
    fetchClients();
    fetchProperties();
    fetchAgents();
  }, []);

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = `${visit.client_prenom} ${visit.client_nom} ${visit.propriete_titre}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'tous' || visit.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'bg-green-100 text-green-800';
      case 'realisee': return 'bg-blue-100 text-blue-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      case 'reportee': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'Planifiée';
      case 'realisee': return 'Réalisée';
      case 'annulee': return 'Annulée';
      case 'reportee': return 'Reportée';
      default: return statut;
    }
  };

  const scheduleVisitNotification = async (visit: Visit) => {
    try {
      // Trouver l'agent par nom ou utiliser l'email de notification
      const selectedAgent = agents.find(a => a.nom === visit.agent);
      const agentEmail = selectedAgent?.email || visit.notification_email;

      if (!agentEmail) {
        throw new Error('Aucun email trouvé pour l\'agent sélectionné');
      }

      console.log('Scheduling notification for visit:', visit.id);
      console.log('Agent email:', agentEmail);
      console.log('Visit date:', visit.date, 'time:', visit.heure);
      console.log('Notification delay:', visit.notification_delay_hours, 'hours');

      const { data, error } = await supabase.functions.invoke('schedule-visit-notification', {
        body: {
          visitId: visit.id,
          agentEmail: agentEmail,
          visitDate: visit.date,
          visitTime: visit.heure,
          clientName: `${visit.client_prenom} ${visit.client_nom}`,
          clientPhone: visit.client_telephone,
          propertyTitle: visit.propriete_titre,
          propertyAddress: visit.propriete_adresse,
          notificationDelayHours: visit.notification_delay_hours || 24
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      console.log('Notification scheduled successfully:', data);

      // Log the scheduled email
      await supabase.from('email_logs').insert([{
        visit_id: visit.id,
        recipient_email: agentEmail,
        email_type: 'visit_reminder',
        status: 'scheduled',
        sent_at: null
      }]);

      // Calculer et afficher quand la notification sera envoyée
      const visitDateTime = new Date(`${visit.date}T${visit.heure}`);
      const notificationTime = new Date(visitDateTime.getTime() - ((visit.notification_delay_hours || 24) * 60 * 60 * 1000));
      
      toast({
        title: "Notification programmée",
        description: `Un email de rappel sera envoyé à ${agentEmail} le ${notificationTime.toLocaleDateString('fr-FR')} à ${notificationTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      
      // Log the failed scheduling
      await supabase.from('email_logs').insert([{
        visit_id: visit.id || '',
        recipient_email: visit.notification_email || '',
        email_type: 'visit_reminder',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }]);

      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "La notification n'a pas pu être programmée",
        variant: "destructive"
      });
    }
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
        agent: '',
        notes: '',
        notification_enabled: false,
        notification_delay_hours: 24,
        notification_email: ''
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

  const handleAgentSelect = (agentName: string) => {
    const selectedAgent = agents.find(a => a.nom === agentName);
    if (selectedAgent) {
      form.setValue('agent', agentName);
      form.setValue('notification_email', selectedAgent.email);
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
        client_id: data.client_id || null,
        property_id: data.property_id || null
      };

      if (selectedVisit) {
        const { error } = await supabase
          .from('visits')
          .update(visitData)
          .eq('id', selectedVisit.id);

        if (error) throw error;

        // Si la visite est planifiée et que les notifications sont activées, programmer la notification
        if (visitData.statut === 'planifiee' && visitData.notification_enabled) {
          const updatedVisit = { ...selectedVisit, ...visitData };
          await scheduleVisitNotification(updatedVisit);
        }

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

        const mappedVisit = {
          ...newVisit,
          statut: newVisit.statut as 'planifiee' | 'realisee' | 'annulee' | 'reportee'
        };

        // Si la visite est planifiée et que les notifications sont activées, programmer la notification
        if (mappedVisit.statut === 'planifiee' && mappedVisit.notification_enabled) {
          await scheduleVisitNotification(mappedVisit);
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

      {/* Statistiques réorganisées */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{visits.length}</div>
            <p className="text-sm text-gray-600">Total Visites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{visits.filter(v => v.statut === 'planifiee').length}</div>
            <p className="text-sm text-gray-600">Planifiées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{visits.filter(v => v.statut === 'realisee').length}</div>
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

      {/* Onglets pour vue liste et calendrier */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Vue Liste
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Vue Calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
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

          {/* Liste des visites */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVisits.map((visit) => (
              <Card key={visit.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {visit.client_prenom} {visit.client_nom}
                    </CardTitle>
                    <Badge className={getStatutColor(visit.statut)}>
                      {getStatutLabel(visit.statut)}
                    </Badge>
                  </div>
                  <CardDescription>{visit.propriete_titre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {new Date(visit.date).toLocaleDateString('fr-FR')}</p>
                    <p><span className="font-medium">Heure:</span> {visit.heure}</p>
                    <p><span className="font-medium">Téléphone:</span> {visit.client_telephone}</p>
                    <p><span className="font-medium">Adresse:</span> {visit.propriete_adresse}</p>
                    {visit.notes && (
                      <p className="text-gray-600 italic">"{visit.notes.substring(0, 50)}..."</p>
                    )}
                    <p><span className="font-medium">Agent:</span> {visit.agent}</p>
                    {visit.notification_enabled && (
                      <p className="flex items-center gap-1 text-blue-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">Notification activée</span>
                      </p>
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
        </TabsContent>

        <TabsContent value="calendar">
          <VisitCalendar onEditVisit={openVisitDialog} />
        </TabsContent>
      </Tabs>

      {/* Dialog pour créer/éditer une visite */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    <Select onValueChange={handleAgentSelect} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.nom}>
                            {agent.nom} - {agent.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section Notifications Email */}
              <div className="md:col-span-2 border-t pt-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notifications Email
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="notification_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Activer les notifications</FormLabel>
                          <div className="text-[0.8rem] text-muted-foreground">
                            Envoyer un rappel par email
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('notification_enabled') && (
                    <>
                      <FormField
                        control={form.control}
                        name="notification_delay_hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Délai de notification</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Délai" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 heure avant</SelectItem>
                                <SelectItem value="24">1 jour avant</SelectItem>
                                <SelectItem value="48">2 jours avant</SelectItem>
                                <SelectItem value="72">3 jours avant</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notification_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email de notification</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un agent" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {agents.filter(agent => agent.statut === 'actif').map((agent) => (
                                  <SelectItem key={agent.id} value={agent.email}>
                                    {agent.nom} - {agent.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>

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
