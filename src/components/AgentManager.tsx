
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
import { Users, Mail, Phone, Edit2, Plus } from 'lucide-react';

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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<Agent>({
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      statut: 'actif'
    }
  });

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

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
        toast({
          title: "Succès",
          description: "Agent mis à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('agents')
          .insert([data]);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Agent créé avec succès"
        });
      }

      setIsDialogOpen(false);
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
            <div className="text-2xl font-bold text-primary">{agents.length}</div>
            <p className="text-sm text-gray-600">Total Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.statut === 'actif').length}
            </div>
            <p className="text-sm text-gray-600">Agents Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {agents.filter(a => a.statut === 'inactif').length}
            </div>
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
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openAgentDialog(agent)}
                  className="w-full"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
