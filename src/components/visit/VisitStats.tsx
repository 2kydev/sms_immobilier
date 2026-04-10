import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface VisitStatsData {
  total: number;
  planifiee: number;
  realisee: number;
  annulee: number;
  reportee: number;
}

interface VisitStatsProps {
  stats: VisitStatsData;
}

const VisitStats: React.FC<VisitStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <p className="text-sm text-gray-600">Total Visites</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">{stats.planifiee}</div>
          <p className="text-sm text-gray-600">Planifiées</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-600">{stats.realisee}</div>
          <p className="text-sm text-gray-600">Réalisées</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-red-600">{stats.annulee}</div>
          <p className="text-sm text-gray-600">Annulées</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-orange-600">{stats.reportee}</div>
          <p className="text-sm text-gray-600">Reportées</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitStats;
