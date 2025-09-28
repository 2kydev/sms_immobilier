import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Home, MapPin, Warehouse, DollarSign } from 'lucide-react';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';

interface SalePropertiesKPIsProps {
  valueByType: {
    terrain: number;
    maison: number;
    entrepot: number;
    immeuble: number;
    autres: number;
  };
  countByType: {
    terrain: number;
    maison: number;
    entrepot: number;
    immeuble: number;
    autres: number;
  };
}

const SalePropertiesKPIs = ({
  valueByType,
  countByType
}: SalePropertiesKPIsProps) => {
  const totalValue = Object.values(valueByType).reduce((sum, value) => sum + value, 0);
  const totalCount = Object.values(countByType).reduce((sum, count) => sum + count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Terrains */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Terrains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-emerald-900">{formatCurrencyFCFA(valueByType.terrain)}</div>
          <p className="text-xs text-emerald-600 mt-1">{countByType.terrain} bien(s)</p>
        </CardContent>
      </Card>

      {/* Maisons */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Maisons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-blue-900">{formatCurrencyFCFA(valueByType.maison)}</div>
          <p className="text-xs text-blue-600 mt-1">{countByType.maison} bien(s)</p>
        </CardContent>
      </Card>

      {/* Entrepôts */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Entrepôts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-purple-900">{formatCurrencyFCFA(valueByType.entrepot)}</div>
          <p className="text-xs text-purple-600 mt-1">{countByType.entrepot} bien(s)</p>
        </CardContent>
      </Card>

      {/* Immeubles */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Immeubles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-indigo-900">{formatCurrencyFCFA(valueByType.immeuble)}</div>
          <p className="text-xs text-indigo-600 mt-1">{countByType.immeuble} bien(s)</p>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-orange-900">{formatCurrencyFCFA(totalValue)}</div>
          <p className="text-xs text-orange-600 mt-1">{totalCount} bien(s)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalePropertiesKPIs;