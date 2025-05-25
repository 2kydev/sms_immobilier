
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface UserStatsProps {
  userCount: number;
}

const UserStats = ({ userCount }: UserStatsProps) => {
  return (
    <Card>
      <CardContent className="px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Total:</span>
          <span className="text-lg font-bold text-primary">{userCount}</span>
          <span className="text-sm text-gray-600">utilisateurs</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;
