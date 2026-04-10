
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAction } from '@/services/auditService';
import { Users, Mail, Phone, Edit2, Plus, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PaginationControls from '@/components/ui/PaginationControls';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 12;

interface Agent {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at: string;
}

const AgentManager = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalAgents, setTotalAgents] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const pagination = usePagination(PAGE_SIZE);

  const form = useForm<Agent>({
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      statut: 'actif'
    }
  });

  const fetchStats = async () => {
    const { data } = await supabase.from('agents').select('statut');
    if (!data) return;
    setTotalAgents(data.length);
    setActiveCount(data.filter(a => a.statut === 'actif').length);
  };

  const fetchAgents = async (forcePage = pagination.page) => {
    setLoading(true);
    const from = (forcePage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      const { data, error, count } = await supabase
        .from('agents')
        .select('*', { count: 'exact' })
        .order('nom', { ascending: true })
        .range(from, to);

      if (error) throw error;
      pagination.setTotalCount(count ?? 0);
      setAgents((data || []).map(agent => ({ ...agent, statut: agent.statut as 'actif' | 'inactif' })));
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAgentDialog = (agent?: Agent) => {
    if (agent) {
      setSelectedAgent(agent);
      form.reset(agent);
    } else {
      setSelectedAgent(null);
      form.reset({
        nom: '',
        email: '',
        telephone: '',
        statut: 'actif'
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: Agent) => {
    try {
      if (selectedAgent) {
        const { error } = await supabase
          .from('agents')
          .update(data)
          .eq('id', selectedAgent.id);

        if (error) throw error;
        logAction({ action: 'update', table: 'agents', recordId: selectedAgent.id, label: data.nom });
        toast({
          title: "Succès",
          description: "Agent mis à jour avec succès"
        });
      } else {
        const { data: inserted, error } = await supabase
          .from('agents')
          .insert([data])
          .select('id')
          .single();

        if (error) throw error;
        if (inserted) logAction({ action: 'create', table: 'agents', recordId: inserted.id, label: data.nom });
        toast({
          title: "Succès",
          description: "Agent créé avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchStats();
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'agent",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    try {
      const { error } = await supabase.from('agents').delete().eq('id', agent.id);
      if (error) throw error;
      logAction({ action: 'delete', table: 'agents', recordId: agent.id, label: agent.nom });
      toast({ title: "Succès", description: "Agent supprimé avec succès" });
      fetchStats();
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer l'agent", variant: "destructive" });
    }
    setAgentToDelete(null);
  };

  const getStatusColor = (statut: string) => {
    return statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return <div className="p-6">Chargement des agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gestion des Agents</h1>
        <Button onClick={() => openAgentDialog()} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Agent
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{totalAgents}</div>
            <p className="text-sm text-gray-600">Total Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-sm text-gray-600">Agents Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{totalAgents - activeCount}</div>
            <p className="text-sm text-gray-600">Agents Inactifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {agent.nom}
                </CardTitle>
                <Badge className={getStatusColor(agent.statut)}>
                  {agent.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {agent.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {agent.telephone}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAgentDialog(agent)}
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAgentToDelete(agent)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={pagination.setPage}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet agent ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'agent <strong>{agentToDelete?.nom}</strong> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => agentToDelete && handleDeleteAgent(agentToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog pour créer/éditer un agent */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAgent ? 'Modifier l\'agent' : 'Nouvel agent'}
            </DialogTitle>
            <DialogDescription>
              Gérez les informations de l'agent immobilier
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'agent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@agence.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="01 23 45 67 89" {...field} />
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
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="inactif">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {selectedAgent ? 'Mettre à jour' : 'Créer'}
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

export default AgentManager;
