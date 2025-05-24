
import React from 'react';
import { Card } from '@/components/ui/card';
import { Transaction } from './types';
import { formatAmount, getDaysInStage } from './utils';

interface TransactionCardProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
}

const TransactionCard = ({ transaction, onClick }: TransactionCardProps) => {
  return (
    <Card 
      className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
      onClick={() => onClick(transaction)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">
            {transaction.clientPrenom} {transaction.clientNom}
          </p>
          <span className="text-xs text-gray-500">
            {getDaysInStage(transaction.derniereActivite)}j
          </span>
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-1">
          {transaction.propriete}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            {formatAmount(transaction.valeur)}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">{transaction.probabilite}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{transaction.agent}</span>
          <span>{transaction.clientTelephone}</span>
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;
