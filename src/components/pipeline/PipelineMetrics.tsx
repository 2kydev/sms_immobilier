
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction } from './types';
import { formatAmount } from './utils';

interface PipelineMetricsProps {
  transactions: Transaction[];
}

const PipelineMetrics = ({ transactions }: PipelineMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-primary">{transactions.length}</div>
          <p className="text-sm text-gray-600">Transactions actives</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">
            {formatAmount(transactions.reduce((sum, t) => sum + t.valeur, 0))}
          </div>
          <p className="text-sm text-gray-600">Valeur totale pipeline</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(transactions.reduce((sum, t) => sum + t.probabilite, 0) / transactions.length)}%
          </div>
          <p className="text-sm text-gray-600">Probabilité moyenne</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-600">
            {formatAmount(Math.round(transactions.reduce((sum, t) => sum + (t.valeur * t.probabilite / 100), 0)))}
          </div>
          <p className="text-sm text-gray-600">Valeur pondérée</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineMetrics;
