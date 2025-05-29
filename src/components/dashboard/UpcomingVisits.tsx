
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface UpcomingVisitsProps {
  upcomingVisits: Array<{
    id: string;
    client: string;
    property: string;
    time: string;
    agent: string;
    date: string;
  }>;
}

const UpcomingVisits = ({ upcomingVisits }: UpcomingVisitsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Visites Aujourd'hui
        </CardTitle>
        <CardDescription>Planning des visites</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {upcomingVisits.length > 0 ? (
          upcomingVisits.map(visit => (
            <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-sm">{visit.client}</p>
                <p className="text-xs text-gray-600 truncate">{visit.property}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">{visit.time}</p>
                <p className="text-xs text-gray-500">{visit.agent}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">Aucune visite programmée aujourd'hui</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingVisits;
