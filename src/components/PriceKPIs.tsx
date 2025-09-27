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
  return;
};
export default PriceKPIs;