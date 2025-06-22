
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, DollarSign, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PropertyStatsData {
  totalProperties: number;
  totalValue: number;
  averagePrice: number;
}

const PropertyStats = () => {
  const [stats, setStats] = useState<PropertyStatsData>({
    totalProperties: 0,
    totalValue: 0,
    averagePrice: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('prix')
        .eq('statut', 'disponible');

      if (error) throw error;

      const totalProperties = data?.length || 0;
      const totalValue = data?.reduce((sum, property) => sum + (property.prix || 0), 0) || 0;
      const averagePrice = totalProperties > 0 ? Math.round(totalValue / totalProperties) : 0;

      setStats({
        totalProperties,
        totalValue,
        averagePrice
      });
    } catch (error) {
      console.error('Error fetching property stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total des biens
          </CardTitle>
          <Building2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalProperties}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Biens disponibles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Valeur totale
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalValue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Estimation totale
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Prix moyen
          </CardTitle>
          <Home className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.averagePrice)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Par bien immobilier
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyStats;
