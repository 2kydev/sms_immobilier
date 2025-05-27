
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Visit {
  id: string;
  statut: 'planifiee' | 'realisee' | 'annulee' | 'reportee';
}

interface VisitStatsProps {
  visits: Visit[];
}

const VisitStats: React.FC<VisitStatsProps> = ({ visits }) => {
  return (
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
  );
};

export default VisitStats;
