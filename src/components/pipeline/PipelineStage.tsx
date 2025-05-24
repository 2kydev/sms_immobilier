
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from './types';
import { formatAmount, getDaysInStage } from './utils';

interface PipelineStageProps {
  etape: {
    key: string;
    label: string;
    color: string;
  };
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const PipelineStage = ({ etape, transactions, onTransactionClick }: PipelineStageProps) => {
  const stageTransactions = transactions.filter(t => t.etape === etape.key);
  const totalValue = stageTransactions.reduce((sum, t) => sum + t.valeur, 0);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{etape.label}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {stageTransactions.length}
          </Badge>
        </div>
        <div className="text-lg font-bold text-primary">
          {formatAmount(totalValue)}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {stageTransactions.map((transaction) => (
            <Card 
              key={transaction.id} 
              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onTransactionClick(transaction)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">
                    Transaction #{transaction.id}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {transaction.probabilite}%
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>Client ID: {transaction.client_id}</div>
                  <div>Propriété ID: {transaction.property_id}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary">
                    {formatAmount(transaction.valeur)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getDaysInStage(transaction.derniere_activite)} j
                  </span>
                </div>
                
                <div className="text-xs text-gray-600">
                  Agent: {transaction.agent}
                </div>
                
                {transaction.notes && (
                  <div className="text-xs text-gray-600 truncate">
                    {transaction.notes}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineStage;
