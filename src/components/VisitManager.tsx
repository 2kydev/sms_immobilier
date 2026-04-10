import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAction } from '@/services/auditService';
import { Calendar, List } from 'lucide-react';
import VisitCalendar from './VisitCalendar';
import VisitCard from './visit/VisitCard';
import VisitFilters from './visit/VisitFilters';
import VisitForm from './visit/VisitForm';
import VisitStats from './visit/VisitStats';
import PaginationControls from '@/components/ui/PaginationControls';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 15;

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
  const [visitStats, setVisitStats] = useState({ total: 0, planifiee: 0, realisee: 0, annulee: 0, reportee: 0 });
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
  const pagination = usePagination(PAGE_SIZE);

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
    }
  });

  const fetchStats = async () => {
    const { data } = await supabase.from('visits').select('statut');
    if (!data) return;
    setVisitStats({
      total: data.length,
      planifiee: data.filter(v => v.statut === 'planifiee').length,
      realisee: data.filter(v => v.statut === 'realisee').length,
      annulee: data.filter(v => v.statut === 'annulee').length,
      reportee: data.filter(v => v.statut === 'reportee').length,
    });
  };

  const fetchVisits = async (forcePage = pagination.page) => {
    setLoading(true);
    const from = (forcePage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      let query = supabase.from('visits').select('*', { count: 'exact' });
      if (searchTerm) {
        query = query.or(
          `client_nom.ilike.%${searchTerm}%,client_prenom.ilike.%${searchTerm}%,propriete_titre.ilike.%${searchTerm}%`
        );
      }
      if (filterStatut !== 'tous') query = query.eq('statut', filterStatut);

      const { data, error, count } = await query
        .order('date', { ascending: true })
        .order('heure', { ascending: true })
        .range(from, to);

      if (error) throw error;
      pagination.setTotalCount(count ?? 0);
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
    } finally {
      setLoading(false);
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
    fetchStats();
    fetchClients();
    fetchProperties();
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pagination.page === 1) {
      fetchVisits(1);
    } else {
      pagination.setPage(1);
    }
  }, [searchTerm, filterStatut]); // eslint-disable-line react-hooks/exhaustive-deps

  const openVisitDialog = (visit?: Visit) => {
    if (visit) {
      setSelectedVisit(visit);
      form.reset({ ...visit });
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
    }
  };

  const onSubmit = async (data: Visit) => {
    
    try {
      // ETAPE 1: Validation de base
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
      };

      if (selectedVisit?.id) {
        const { error } = await supabase
          .from('visits')
          .update(visitData)
          .eq('id', selectedVisit.id);
        if (error) throw error;
        logAction({ action: 'update', table: 'visits', recordId: selectedVisit.id, label: `${visitData.client_prenom} ${visitData.client_nom} — ${visitData.propriete_titre}` });
      } else {
        const { data: inserted, error } = await supabase
          .from('visits')
          .insert([visitData])
          .select('id')
          .single();
        if (error) throw error;
        if (inserted) logAction({ action: 'create', table: 'visits', recordId: inserted.id, label: `${visitData.client_prenom} ${visitData.client_nom} — ${visitData.propriete_titre}` });
      }

      toast({
        title: "Succès",
        description: selectedVisit ? "Visite mise à jour avec succès" : "Visite créée avec succès"
      });
      
      setIsDialogOpen(false);
      fetchStats();
      await fetchVisits();

    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder la visite",
        variant: "destructive"
      });
    }
  };

  if (loading && visits.length === 0) {
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

      <VisitStats stats={visitStats} />

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
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onEdit={openVisitDialog}
              />
            ))}
            {visits.length === 0 && !loading && (
              <p className="col-span-3 text-center py-8 text-muted-foreground">
                Aucune visite trouvée avec ces critères
              </p>
            )}
          </div>

          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={pagination.setPage}
          />
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
