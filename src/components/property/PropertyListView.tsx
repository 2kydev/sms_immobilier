
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PropertyStats from '@/components/PropertyStats';

interface PropertyListViewProps {
  onAddProperty: () => void;
}

const PropertyListView: React.FC<PropertyListViewProps> = ({ onAddProperty }) => {
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
          <CardTitle>Gestion des biens immobiliers</CardTitle>
          <CardDescription>
            Consultez les statistiques de vos biens et ajoutez de nouveaux biens à vendre ou à louer
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Commencez par ajouter un bien
              </h3>
              <p className="text-gray-500 mb-4">
                Enregistrez vos premiers biens immobiliers pour commencer à les gérer efficacement.
              </p>
            </div>
            <Button 
              onClick={onAddProperty}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un bien immobilier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyListView;
