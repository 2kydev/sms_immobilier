
import React, { useState } from 'react';
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

interface Visit {
  id: number;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  proprieteAdresse: string;
  proprieteTitre: string;
  date: string;
  heure: string;
  statut: 'planifiee' | 'realisee' | 'annulee' | 'reportee';
  agent: string;
  notes: string;
  feedbackClient?: string;
  noteVisite?: number;
}

const VisitManager = () => {
  const [visits, setVisits] = useState<Visit[]>([
    {
      id: 1,
      clientNom: 'Martin',
      clientPrenom: 'Jean',
      clientTelephone: '06 12 34 56 78',
      proprieteAdresse: '12 rue de la République, 75011 Paris',
      proprieteTitre: 'Appartement 3 pièces avec balcon',
      date: '2024-05-24',
      heure: '14:00',
      statut: 'planifiee',
      agent: 'Marie Dupont',
      notes: 'Client très intéressé, prévoir documentation complète'
    },
    {
      id: 2,
      clientNom: 'Bernard',
      clientPrenom: 'Sophie',
      clientTelephone: '06 98 76 54 32',
      proprieteAdresse: '45 avenue des Tilleuls, 92160 Antony',
      proprieteTitre: 'Maison familiale avec jardin',
      date: '2024-05-24',
      heure: '16:30',
      statut: 'realisee',
      agent: 'Pierre Leroy',
      notes: 'Visite de courtoisie',
      feedbackClient: 'Très satisfait de la visite, maison correspond aux attentes',
      noteVisite: 9
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('tous');

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
    setSelectedVisit(visit || {
      id: 0,
      clientNom: '',
      clientPrenom: '',
      clientTelephone: '',
      proprieteAdresse: '',
      proprieteTitre: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      heure: '',
      statut: 'planifiee',
      agent: 'Marie Dupont',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const visitsAujourdhui = visits.filter(v => v.date === format(new Date(), 'yyyy-MM-dd'));
  const visitesRealiseesAujourdhui = visitsAujourdhui.filter(v => v.statut === 'realisee').length;

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
              {visits.filter(v => v.noteVisite).length > 0 
                ? Math.round(visits.filter(v => v.noteVisite).reduce((sum, v) => sum + (v.noteVisite || 0), 0) / visits.filter(v => v.noteVisite).length * 10) / 10
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
                        {visit.heure} - {visit.clientPrenom} {visit.clientNom}
                      </CardTitle>
                      <CardDescription>{visit.clientTelephone}</CardDescription>
                    </div>
                    <Badge className={getStatutColor(visit.statut)}>
                      {getStatutLabel(visit.statut)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-sm">{visit.proprieteTitre}</p>
                      <p className="text-sm text-gray-600">{visit.proprieteAdresse}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Agent: {visit.agent}</span>
                      {visit.noteVisite && (
                        <span className="text-green-600 font-medium">Note: {visit.noteVisite}/10</span>
                      )}
                    </div>

                    {visit.notes && (
                      <p className="text-sm text-gray-600 italic">"{visit.notes}"</p>
                    )}

                    {visit.feedbackClient && (
                      <div className="bg-green-50 p-2 rounded-lg">
                        <p className="text-sm text-green-800">Feedback: {visit.feedbackClient}</p>
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
              {selectedVisit?.id ? 'Modifier la visite' : 'Nouvelle visite'}
            </DialogTitle>
            <DialogDescription>
              Planifiez ou modifiez une visite client
            </DialogDescription>
          </DialogHeader>
          
          {selectedVisit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientPrenom">Prénom du client</Label>
                <Input id="clientPrenom" defaultValue={selectedVisit.clientPrenom} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientNom">Nom du client</Label>
                <Input id="clientNom" defaultValue={selectedVisit.clientNom} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientTelephone">Téléphone</Label>
                <Input id="clientTelephone" defaultValue={selectedVisit.clientTelephone} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent">Agent responsable</Label>
                <Select defaultValue={selectedVisit.agent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marie Dupont">Marie Dupont</SelectItem>
                    <SelectItem value="Pierre Leroy">Pierre Leroy</SelectItem>
                    <SelectItem value="Sophie Martin">Sophie Martin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="proprieteTitre">Propriété visitée</Label>
                <Input id="proprieteTitre" defaultValue={selectedVisit.proprieteTitre} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="proprieteAdresse">Adresse de la propriété</Label>
                <Input id="proprieteAdresse" defaultValue={selectedVisit.proprieteAdresse} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" defaultValue={selectedVisit.date} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heure">Heure</Label>
                <Input id="heure" type="time" defaultValue={selectedVisit.heure} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select defaultValue={selectedVisit.statut}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planifiee">Planifiée</SelectItem>
                    <SelectItem value="realisee">Réalisée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                    <SelectItem value="reportee">Reportée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedVisit.statut === 'realisee' && (
                <div className="space-y-2">
                  <Label htmlFor="noteVisite">Note de la visite (/10)</Label>
                  <Input id="noteVisite" type="number" min="1" max="10" defaultValue={selectedVisit.noteVisite} />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Notes sur la visite..." defaultValue={selectedVisit.notes} />
              </div>

              {selectedVisit.statut === 'realisee' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="feedbackClient">Feedback client</Label>
                  <Textarea id="feedbackClient" placeholder="Retour du client après la visite..." defaultValue={selectedVisit.feedbackClient} />
                </div>
              )}

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  {selectedVisit.id ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitManager;
