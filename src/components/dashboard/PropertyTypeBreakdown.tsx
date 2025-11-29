import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Mountain, Warehouse, Building } from 'lucide-react';

interface PropertyTypeBreakdownProps {
  availableMaisons: number;
  availableTerrains: number;
  availableEntrepots: number;
  saleCountByType: {
    maison: number;
    terrain: number;
    entrepot: number;
    immeuble: number;
  };
}

const PropertyTypeBreakdown = ({
  availableMaisons,
  availableTerrains,
  availableEntrepots,
  saleCountByType,
}: PropertyTypeBreakdownProps) => {
  const types = [
    {
      label: 'Terrains',
      count: availableTerrains + saleCountByType.terrain,
      icon: Mountain,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Maisons',
      count: availableMaisons + saleCountByType.maison,
      icon: Home,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Entrepôts',
      count: availableEntrepots + saleCountByType.entrepot,
      icon: Warehouse,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      label: 'Immeubles',
      count: saleCountByType.immeuble,
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Répartition par Type de Bien
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {types.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className={`${type.bgColor} p-2 rounded-md`}>
                  <Icon className={`h-5 w-5 ${type.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {type.count}
                  </p>
                  <p className="text-xs text-muted-foreground">{type.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyTypeBreakdown;
