import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { TopVisitedProperty } from '@/types/enhancedDashboard';

interface TopVisitedPropertiesProps {
  properties: TopVisitedProperty[];
}

const TopVisitedProperties = ({ properties }: TopVisitedPropertiesProps) => {
  if (properties.length === 0) return null;

  const max = properties[0]?.visitCount || 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Biens les plus visités
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {properties.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.titre}</p>
              <p className="text-xs text-muted-foreground truncate">{p.city}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(p.visitCount / max) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums w-6 text-right">{p.visitCount}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopVisitedProperties;
