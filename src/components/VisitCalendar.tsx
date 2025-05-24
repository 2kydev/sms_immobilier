import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface VisitCalendarProps {
  onEditVisit: (visit: Visit) => void;
}

const VisitCalendar: React.FC<VisitCalendarProps> = ({ onEditVisit }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDateVisits, setSelectedDateVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      
      // Type cast les données pour s'assurer que le statut correspond au type attendu
      const typedVisits = (data || []).map(visit => ({
        ...visit,
        statut: visit.statut as 'planifiee' | 'realisee' | 'annulee' | 'reportee'
      }));
      
      setVisits(typedVisits);
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

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'bg-green-100 text-green-800 border-green-200';
      case 'realisee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'annulee': return 'bg-red-100 text-red-800 border-red-200';
      case 'reportee': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Grouper les visites par date
  const visitsByDate = visits.reduce((acc, visit) => {
    const date = visit.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(visit);
    return acc;
  }, {} as Record<string, Visit[]>);

  // Créer les modificateurs pour le calendrier
  const modifiers = {
    hasVisits: Object.keys(visitsByDate).map(date => new Date(date)),
    planifiee: visits
      .filter(v => v.statut === 'planifiee')
      .map(v => new Date(v.date)),
    realisee: visits
      .filter(v => v.statut === 'realisee')
      .map(v => new Date(v.date)),
    annulee: visits
      .filter(v => v.statut === 'annulee')
      .map(v => new Date(v.date)),
    reportee: visits
      .filter(v => v.statut === 'reportee')
      .map(v => new Date(v.date))
  };

  const modifiersStyles = {
    planifiee: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
    realisee: { backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' },
    annulee: { backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 'bold' },
    reportee: { backgroundColor: '#fed7aa', color: '#ea580c', fontWeight: 'bold' }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      const visitsForDate = visitsByDate[dateStr] || [];
      if (visitsForDate.length > 0) {
        setSelectedDateVisits(visitsForDate);
        setIsDetailsOpen(true);
      }
    }
  };

  if (loading) {
    return <div className="p-6">Chargement du calendrier...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Légendes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendrier des Visites
          </CardTitle>
          <CardDescription>
            Cliquez sur une date pour voir les détails des visites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200 border border-green-300"></div>
              <span className="text-sm">Planifiée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200 border border-blue-300"></div>
              <span className="text-sm">Réalisée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200 border border-red-300"></div>
              <span className="text-sm">Annulée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-200 border border-orange-300"></div>
              <span className="text-sm">Reportée</span>
            </div>
          </div>
          
          {/* Calendrier */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog des détails de la date */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Visites du {selectedDate?.toLocaleDateString('fr-FR')}
            </DialogTitle>
            <DialogDescription>
              {selectedDateVisits.length} visite(s) prévue(s) ce jour
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDateVisits.map((visit) => (
              <Card key={visit.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        {visit.client_prenom} {visit.client_nom}
                      </h3>
                      <Badge className={getStatutColor(visit.statut)}>
                        {getStatutLabel(visit.statut)}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{visit.heure}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Propriété:</span> {visit.propriete_titre}</p>
                    <p><span className="font-medium">Adresse:</span> {visit.propriete_adresse}</p>
                    <p><span className="font-medium">Téléphone:</span> {visit.client_telephone}</p>
                    <p><span className="font-medium">Agent:</span> {visit.agent}</p>
                    {visit.notes && (
                      <p><span className="font-medium">Notes:</span> {visit.notes}</p>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEditVisit(visit)}
                      className="w-full"
                    >
                      Modifier cette visite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitCalendar;
