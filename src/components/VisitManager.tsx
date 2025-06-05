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
import VisitStats from './VisitStats';

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
  agent_notification_email?: string;
  client_notification_email?: string;
}

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
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
      notification_email: '',
      agent_notification_email: '',
      client_notification_email: ''
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
        .select('id, nom, prenom, telephone, email')
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

  const scheduleVisitNotifications = async (visit: Visit) => {
    try {
      const emailsToSend = [];
      
      // Ajouter l'email de l'agent si sélectionné
      if (visit.agent_notification_email && visit.agent_notification_email.trim() !== '') {
        emailsToSend.push({
          email: visit.agent_notification_email,
          type: 'agent'
        });
      }
      
      // Ajouter l'email du client si sélectionné
      if (visit.client_notification_email && visit.client_notification_email.trim() !== '') {
        emailsToSend.push({
          email: visit.client_notification_email,
          type: 'client'
        });
      }

      // Programmer les notifications pour chaque email
      for (const emailConfig of emailsToSend) {
        console.log(`Scheduling notification for ${emailConfig.type}:`, emailConfig.email);

        const { data, error } = await supabase.functions.invoke('schedule-visit-notification', {
          body: {
            visitId: visit.id,
            agentEmail: emailConfig.email,
            visitDate: visit.date,
            visitTime: visit.heure,
            clientName: `${visit.client_prenom} ${visit.client_nom}`,
            clientPhone: visit.client_telephone,
            propertyTitle: visit.propriete_titre,
            propertyAddress: visit.propriete_adresse,
            notificationDelayHours: visit.notification_delay_hours || 24,
            recipientType: emailConfig.type
          }
        });

        if (error) throw error;

        // Enregistrer le log de programmation
        await supabase.from('email_logs').insert([{
          visit_id: visit.id,
          recipient_email: emailConfig.email,
          email_type: 'visit_reminder',
          status: 'scheduled',
          sent_at: null
        }]);
      }

      if (emailsToSend.length > 0) {
        const visitDateTime = new Date(`${visit.date}T${visit.heure}`);
        const notificationTime = new Date(visitDateTime.getTime() - ((visit.notification_delay_hours || 24) * 60 * 60 * 1000));
        
        const recipientsList = emailsToSend.map(e => e.email).join(', ');
        
        toast({
          title: "Notifications programmées",
          description: `Des emails de rappel seront envoyés à ${recipientsList} le ${notificationTime.toLocaleDateString('fr-FR')} à ${notificationTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
        });
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Les notifications n'ont pas pu être programmées",
        variant: "destructive"
      });
    }
  };

  const openVisitDialog = (visit?: Visit) => {
    if (visit) {
      setSelectedVisit(visit);
      form.reset({
        ...visit,
        agent_notification_email: visit.agent_notification_email || '',
        client_notification_email: visit.client_notification_email || ''
      });
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
        notification_email: '',
        agent_notification_email: '',
        client_notification_email: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleClientSelect = (clientId: string) => {
    console.log('🔍 ETAPE 1: Sélection client - ID:', clientId);
    const selectedClient = clients.find(c => c.id === clientId);
    console.log('🔍 ETAPE 2: Client trouvé:', selectedClient);
    
    if (selectedClient) {
      console.log('📝 ETAPE 3: Mise à jour des champs client...');
      form.setValue('client_nom', selectedClient.nom);
      form.setValue('client_prenom', selectedClient.prenom);
      form.setValue('client_telephone', selectedClient.telephone);
      form.setValue('client_id', clientId);
      
      if (selectedClient.email && selectedClient.email.trim() !== '') {
        console.log('📧 ETAPE 4: Attribution email client:', selectedClient.email);
        form.setValue('client_notification_email', selectedClient.email);
      } else {
        console.log('⚠️ ETAPE 4: Pas d\'email valide pour le client');
        form.setValue('client_notification_email', '');
      }
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    console.log('🔍 ETAPE 1: Sélection propriété - ID:', propertyId);
    const selectedProperty = properties.find(p => p.id === propertyId);
    console.log('🔍 ETAPE 2: Propriété trouvée:', selectedProperty);
    
    if (selectedProperty) {
      console.log('📝 ETAPE 3: Mise à jour des champs propriété...');
      form.setValue('propriete_titre', selectedProperty.titre);
      form.setValue('propriete_adresse', `${selectedProperty.city} - ${selectedProperty.quartier}`);
      form.setValue('property_id', propertyId);
    }
  };

  const handleAgentSelect = (agentName: string) => {
    console.log('🔍 ETAPE 1: Sélection agent - Nom:', agentName);
    const selectedAgent = agents.find(a => a.nom === agentName);
    console.log('🔍 ETAPE 2: Agent trouvé:', selectedAgent);
    
    if (selectedAgent) {
      console.log('📝 ETAPE 3: Mise à jour des champs agent...');
      form.setValue('agent', agentName);
      form.setValue('notification_email', selectedAgent.email);
      
      if (selectedAgent.email && selectedAgent.email.trim() !== '') {
        console.log('📧 ETAPE 4: Attribution email agent:', selectedAgent.email);
        form.setValue('agent_notification_email', selectedAgent.email);
      } else {
        console.log('⚠️ ETAPE 4: Pas d\'email valide pour l\'agent');
        form.setValue('agent_notification_email', '');
      }
    }
  };

  const onSubmit = async (data: Visit) => {
    console.log('🚀 DEBUT SAUVEGARDE - Données reçues:', JSON.stringify(data, null, 2));
    
    try {
      // ETAPE 1: Validation de base
      console.log('📋 ETAPE 1: Validation de base');
      if (!data.client_nom?.trim()) {
        throw new Error('Le nom du client est obligatoire');
      }
      if (!data.client_prenom?.trim()) {
        throw new Error('Le prénom du client est obligatoire');
      }
      if (!data.propriete_titre?.trim()) {
        throw new Error('Le titre de la propriété est obligatoire');
      }
      if (!data.date) {
        throw new Error('La date est obligatoire');
      }
      if (!data.heure) {
        throw new Error('L\'heure est obligatoire');
      }
      if (!data.agent?.trim()) {
        throw new Error('L\'agent est obligatoire');
      }
      console.log('✅ ETAPE 1: Validation de base OK');

      // ETAPE 2: Validation notifications
      console.log('📧 ETAPE 2: Validation notifications');
      if (data.notification_enabled) {
        console.log('Notifications activées, vérification emails...');
        if (!data.agent_notification_email?.trim() && !data.client_notification_email?.trim()) {
          throw new Error('Au moins un email de notification est requis si les notifications sont activées');
        }
        console.log('✅ Au moins un email de notification présent');
      }
      console.log('✅ ETAPE 2: Validation notifications OK');

      // ETAPE 3: Préparation des données
      console.log('🧹 ETAPE 3: Préparation des données');
      const visitData = {
        client_nom: data.client_nom.trim(),
        client_prenom: data.client_prenom.trim(),
        client_telephone: data.client_telephone?.trim() || '',
        propriete_titre: data.propriete_titre.trim(),
        propriete_adresse: data.propriete_adresse?.trim() || '',
        date: data.date,
        heure: data.heure,
        statut: data.statut,
        agent: data.agent.trim(),
        notes: data.notes?.trim() || null,
        feedback_client: data.feedback_client?.trim() || null,
        client_id: data.client_id || null,
        property_id: data.property_id || null,
        notification_enabled: Boolean(data.notification_enabled),
        notification_delay_hours: Number(data.notification_delay_hours) || 24,
        agent_notification_email: data.agent_notification_email?.trim() || null,
        client_notification_email: data.client_notification_email?.trim() || null,
        notification_email: data.notification_email?.trim() || null
      };
      console.log('📦 ETAPE 3: Données préparées:', JSON.stringify(visitData, null, 2));

      // ETAPE 4: Test de connexion Supabase
      console.log('🔗 ETAPE 4: Test connexion Supabase');
      const { error: connectionError } = await supabase.from('visits').select('count').limit(1);
      if (connectionError) {
        console.error('❌ Erreur connexion:', connectionError);
        throw new Error(`Problème de connexion: ${connectionError.message}`);
      }
      console.log('✅ ETAPE 4: Connexion Supabase OK');

      // ETAPE 5: Sauvegarde
      if (selectedVisit?.id) {
        console.log('🔄 ETAPE 5: MISE À JOUR visite ID:', selectedVisit.id);
        const { data: result, error } = await supabase
          .from('visits')
          .update(visitData)
          .eq('id', selectedVisit.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur mise à jour:', error);
          console.error('❌ Code:', error.code);
          console.error('❌ Message:', error.message);
          console.error('❌ Détails:', error.details);
          throw new Error(`Erreur mise à jour: ${error.message}`);
        }

        console.log('✅ ETAPE 5: Mise à jour réussie:', result);
      } else {
        console.log('🆕 ETAPE 5: CRÉATION nouvelle visite');
        const { data: result, error } = await supabase
          .from('visits')
          .insert([visitData])
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur création:', error);
          console.error('❌ Code:', error.code);
          console.error('❌ Message:', error.message);
          console.error('❌ Détails:', error.details);
          throw new Error(`Erreur création: ${error.message}`);
        }

        console.log('✅ ETAPE 5: Création réussie:', result);
      }

      console.log('🎉 SAUVEGARDE TERMINÉE AVEC SUCCÈS');
      toast({
        title: "Succès",
        description: selectedVisit ? "Visite mise à jour avec succès" : "Visite créée avec succès"
      });
      
      setIsDialogOpen(false);
      await fetchVisits();

    } catch (error) {
      console.error('💥 ERREUR CRITIQUE:', error);
      console.error('💥 Type:', typeof error);
      console.error('💥 Message:', error instanceof Error ? error.message : 'Erreur inconnue');
      console.error('💥 Stack:', error instanceof Error ? error.stack : 'Pas de stack');
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder la visite",
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
