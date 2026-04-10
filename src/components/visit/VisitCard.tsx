import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface VisitCardProps {
  visit: Visit;
  onEdit: (visit: Visit) => void;
}

const VisitCard: React.FC<VisitCardProps> = ({ visit, onEdit }) => {
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

  return (
    <Card className="card-hover">
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
        </div>
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(visit)}
            className="w-full"
          >
            Modifier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitCard;
