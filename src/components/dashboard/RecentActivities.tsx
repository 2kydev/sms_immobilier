
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentActivitiesProps {
  recentActivities: Array<{
    id: string;
    action: string;
    description: string;
    time: string;
    type: string;
  }>;
}

const RecentActivities = ({ recentActivities }: RecentActivitiesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
        <CardDescription>Dernières actions dans le CRM</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {recentActivities.length > 0 ? (
          recentActivities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'transaction' ? 'bg-blue-500' : 
                activity.type === 'deal' ? 'bg-green-500' : 
                activity.type === 'property' ? 'bg-yellow-500' : 'bg-purple-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-400">Il y a {activity.time}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">Aucune activité récente</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
