
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import PropertyStats from '@/components/PropertyStats';
import { fetchRecentActivities } from '@/services/dashboardActivitiesService';

interface PropertyListViewProps {
  onAddProperty: () => void;
}

const PropertyListView: React.FC<PropertyListViewProps> = ({ onAddProperty }) => {
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    action: string;
    description: string;
    time: string;
    type: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activities = await fetchRecentActivities();
        setRecentActivities(activities);
      } catch (error) {
        console.error('Erreur lors du chargement des activités récentes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Biens immobiliers</h1>
        <Button 
          onClick={onAddProperty}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Ajouter un nouveau bien
        </Button>
      </div>

      <PropertyStats />

      <Card>
        <CardHeader>
          <CardTitle>Actions récentes</CardTitle>
          <CardDescription>
            Dernières activités liées aux biens immobiliers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">Chargement des activités récentes...</div>
          ) : recentActivities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.action}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.type === 'transaction' ? 'bg-blue-100 text-blue-800' : 
                        activity.type === 'deal' ? 'bg-green-100 text-green-800' : 
                        activity.type === 'property' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {activity.type === 'transaction' ? 'Transaction' :
                         activity.type === 'deal' ? 'Vente' :
                         activity.type === 'property' ? 'Propriété' : 'Autre'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">Il y a {activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune activité récente à afficher
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyListView;
