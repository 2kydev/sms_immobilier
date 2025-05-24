
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Visit {
  id: string;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  propriete_adresse: string;
  propriete_titre: string;
  date: string;
  heure: string;
  statut: 'planifiee' | 'realisee' | 'annulee' | 'reportee';
  agent: string;
  notes: string;
  feedback_client?: string;
  note_visite?: number;
}

const VisitManager = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<Visit>({
    defaultValues: {
      client_nom: '',
      client_prenom: '',
      client_telephone: '',
      propriete_adresse: '',
      propriete_titre: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      heure: '',
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
      setVisits(data || []);
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

  useEffect(() => {
    fetchVisits();
  }, []);

  const filteredVisits = visits.filter(visit => {
    const matchesDate = visit.date === format(selectedDate, 'yyyy-MM-dd');
    const matchesStatut = filterStatut === 'tous' || visit.statut === filterStatut;
    return matchesDate && matchesStatut;
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

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'Planifiée';
      case 'realisee': return 'Réalisée';
      case 'annulee': return 'Annulée';
      case 'reportee': return 'Reportée';
      default: return statut;
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
        propriete_adresse: '',
        propriete_titre: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        heure: '',
        statut: 'planifiee',
        agent: 'Marie Dupont',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: Visit) => {
    try {
      const visitData = {
        ...data,
        feedback_client: data.feedback_client || null,
        note_visite: data.note_visite || null
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
        const { error } = await supabase
          .from('visits')
          .insert([visitData]);

        if (error) throw error;
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

  const visitsAujourdhui = visits.filter(v => v.date === format(new Date(), 'yyyy-MM-dd'));
  const visitesRealiseesAujourdhui = visitsAujourdhui.filter(v => v.statut === 'realisee').length;

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

      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{visitsAujourdhui.length}</div>
            <p className="text-sm text-gray-600">Visites aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{visitesRealiseesAujourdhui}</div>
            <p className="text-sm text-gray-600">Réalisées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{visitsAujourdhui.length - visitesRealiseesAujourdhui}</div>
            <p className="text-sm text-gray-600">À venir</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {visits.filter(v => v.note_visite).length > 0 
                ? Math.round(visits.filter(v => v.note_visite).reduce((sum, v) => sum + (v.note_visite || 0), 0) / visits.filter(v => v.note_visite).length * 10) / 10
                : '-'}/10
            </div>
            <p className="text-sm text-gray-600">Note moyenne</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <Card>
          <CardHeader>
            <CardTitle>Calendrier des Visites</CardTitle>
            <CardDescription>Sélectionnez une date pour voir les visites</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border pointer-events-auto"
              locale={fr}
            />
            <div className="mt-4">
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="planifiee">Planifiées</SelectItem>
                  <SelectItem value="realisee">Réalisées</SelectItem>
                  <SelectItem value="annulee">Annulées</SelectItem>
                  <SelectItem value="reportee">Reportées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des visites */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Visites du {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </CardTitle>
              <CardDescription>
                {filteredVisits.length} visite{filteredVisits.length > 1 ? 's' : ''} programmée{filteredVisits.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
          </Card>

          {filteredVisits.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Aucune visite programmée pour cette date
              </CardContent>
            </Card>
          ) : (
            filteredVisits.map((visit) => (
              <Card key={visit.id} className="card-hover cursor-pointer" onClick={() => openVisitDialog(visit)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {visit.heure} - {visit.client_prenom} {visit.client_nom}
                      </CardTitle>
                      <CardDescription>{visit.client_telephone}</CardDescription>
                    </div>
                    <Badge className={getStatutColor(visit.statut)}>
                      {getStatutLabel(visit.statut)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-sm">{visit.propriete_titre}</p>
                      <p className="text-sm text-gray-600">{visit.propriete_adresse}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Agent: {visit.agent}</span>
                      {visit.note_visite && (
                        <span className="text-green-600 font-medium">Note: {visit.note_visite}/10</span>
                      )}
                    </div>

                    {visit.notes && (
                      <p className="text-sm text-gray-600 italic">"{visit.notes}"</p>
                    )}

                    {visit.feedback_client && (
                      <div className="bg-green-50 p-2 rounded-lg">
                        <p className="text-sm text-green-800">Feedback: {visit.feedback_client}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialog pour créer/éditer une visite */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVisit ? 'Modifier la visite' : 'Nouvelle visite'}
            </DialogTitle>
            <DialogDescription>
              Planifiez ou modifiez une visite client
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom du client</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du client</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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

              <FormField
                control={form.control}
                name="propriete_titre"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Propriété visitée</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propriete_adresse"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Adresse de la propriété</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                name="note_visite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note de la visite (/10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} onChange={(e) => field.onChange(Number(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="feedback_client"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Feedback client</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Retour du client après la visite..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
