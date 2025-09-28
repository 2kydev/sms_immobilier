import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Home, MapPin, Warehouse, TrendingUp } from 'lucide-react';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';

interface PropertyManagementKPIsProps {
  totalProperties: number;
  availableProperties: number;
  availableMaisons: number;
  availableTerrains: number;
  availableEntrepots: number;
  valueByType: {
    maison: number;
    terrain: number;
    entrepot: number;
    autres: number;
  };
}

const PropertyManagementKPIs = ({
  totalProperties,
  availableProperties,
  availableMaisons,
  availableTerrains,
  availableEntrepots,
  valueByType
}: PropertyManagementKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total des biens */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Total Biens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{totalProperties}</div>
          <p className="text-xs text-blue-600 mt-1">Dans le portefeuille</p>
        </CardContent>
      </Card>

      {/* Biens disponibles */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Biens Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{availableProperties}</div>
          <p className="text-xs text-green-600 mt-1">Prêts à commercialiser</p>
        </CardContent>
      </Card>

      {/* Répartition par type */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Disponibles par Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-purple-600">
                <Home className="h-3 w-3" />
                Maisons
              </span>
              <span className="font-semibold text-purple-900">{availableMaisons}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-purple-600">
                <MapPin className="h-3 w-3" />
                Terrains
              </span>
              <span className="font-semibold text-purple-900">{availableTerrains}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-purple-600">
                <Warehouse className="h-3 w-3" />
                Entrepôts
              </span>
              <span className="font-semibold text-purple-900">{availableEntrepots}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valeur par type */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Valeur par Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">Maisons</span>
              <span className="font-semibold text-orange-900">{formatCurrencyFCFA(valueByType.maison)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">Terrains</span>
              <span className="font-semibold text-orange-900">{formatCurrencyFCFA(valueByType.terrain)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">Entrepôts</span>
              <span className="font-semibold text-orange-900">{formatCurrencyFCFA(valueByType.entrepot)}</span>
            </div>
            {valueByType.autres > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-orange-600">Autres</span>
                <span className="font-semibold text-orange-900">{formatCurrencyFCFA(valueByType.autres)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyManagementKPIs;