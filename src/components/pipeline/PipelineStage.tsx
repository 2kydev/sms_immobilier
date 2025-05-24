
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from './types';
import { formatAmount } from './utils';
import TransactionCard from './TransactionCard';

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
  const transactionsEtape = transactions.filter(t => t.etape === etape.key);
  const valeurTotale = transactionsEtape.reduce((sum, t) => sum + t.valeur, 0);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{etape.label}</CardTitle>
          <Badge className={etape.color}>
            {transactionsEtape.length}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {formatAmount(valeurTotale)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {transactionsEtape.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onClick={onTransactionClick}
          />
        ))}
        
        {transactionsEtape.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            Aucune transaction
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PipelineStage;
