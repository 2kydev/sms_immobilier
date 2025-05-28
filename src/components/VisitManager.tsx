import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, List } from 'lucide-react';
import VisitCalendar from './VisitCalendar';
import VisitCard from './visit/VisitCard';
import VisitFilters from './visit/VisitFilters';
import VisitForm from './visit/VisitForm';
import VisitStats from './visit/VisitStats';

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

  const scheduleVisitNotification = async (visit: Visit) => {
    try {
      const selectedAgent = agents.find(a => a.nom === visit.agent);
      const agentEmail = selectedAgent?.email || visit.notification_email;

      if (!agentEmail) {
        throw new Error('Aucun email trouvé pour l\'agent sélectionné');
      }

      console.log('Scheduling notification for visit:', visit.id);

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

      if (error) throw error;

      await supabase.from('email_logs').insert([{
        visit_id: visit.id,
        recipient_email: agentEmail,
        email_type: 'visit_reminder',
        status: 'scheduled',
        sent_at: null
      }]);

      const visitDateTime = new Date(`${visit.date}T${visit.heure}`);
      const notificationTime = new Date(visitDateTime.getTime() - ((visit.notification_delay_hours || 24) * 60 * 60 * 1000));
      
      toast({
        title: "Notification programmée",
        description: `Un email de rappel sera envoyé à ${agentEmail} le ${notificationTime.toLocaleDateString('fr-FR')} à ${notificationTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      
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

      <VisitStats visits={visits} />

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
          <VisitFilters
            searchTerm={searchTerm}
            filterStatut={filterStatut}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilterStatut}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVisits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onEdit={openVisitDialog}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <VisitCalendar onEditVisit={openVisitDialog} />
        </TabsContent>
      </Tabs>

      <VisitForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        form={form}
        onSubmit={onSubmit}
        selectedVisit={selectedVisit}
        clients={clients}
        properties={properties}
        agents={agents}
        onClientSelect={handleClientSelect}
        onPropertySelect={handlePropertySelect}
        onAgentSelect={handleAgentSelect}
      />
    </div>
  );
};

export default VisitManager;
