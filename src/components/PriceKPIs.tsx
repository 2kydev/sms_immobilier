import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Building2 } from 'lucide-react';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';

interface PriceKPIsProps {
  totalValue: number;
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  priceDistribution?: {
    vente: number;
    location: number;
  };
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
}

const PriceKPIs = ({
  totalValue,
  averagePrice,
  medianPrice,
  priceRange,
  priceDistribution,
  trend
}: PriceKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Valeur Totale du Portefeuille */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Valeur Totale</p>
              <p className="text-3xl font-bold">{formatCurrencyFCFA(totalValue)}F</p>
              {trend && (
                <div className="flex items-center gap-1 mt-1">
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-blue-200" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-blue-200" />
                  )}
                  <span className="text-xs text-blue-200">
                    {trend.percentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <Building2 className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      {/* Prix Moyen */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Prix Moyen</p>
              <p className="text-3xl font-bold">{formatCurrencyFCFA(averagePrice)}F</p>
              <p className="text-xs text-green-200 mt-1">par bien</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>

      {/* Prix Médian */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Prix Médian</p>
              <p className="text-3xl font-bold">{formatCurrencyFCFA(medianPrice)}F</p>
              <p className="text-xs text-purple-200 mt-1">50% des biens</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      {/* Fourchette de Prix */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Fourchette</p>
              <p className="text-lg font-bold">{formatCurrencyFCFA(priceRange.min)}F</p>
              <p className="text-xs text-orange-200">à</p>
              <p className="text-lg font-bold">{formatCurrencyFCFA(priceRange.max)}F</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      {/* Répartition Vente/Location si fournie */}
      {priceDistribution && (
        <>
          <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Valeur Ventes</p>
                  <p className="text-2xl font-bold">{formatCurrencyFCFA(priceDistribution.vente)}F</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Valeur Locations</p>
                  <p className="text-2xl font-bold">{formatCurrencyFCFA(priceDistribution.location)}F</p>
                </div>
                <Building2 className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PriceKPIs;