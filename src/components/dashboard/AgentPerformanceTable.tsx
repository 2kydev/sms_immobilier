import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { AgentPerformance } from '@/types/enhancedDashboard';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';

interface AgentPerformanceTableProps {
  agents: AgentPerformance[];
}

const AgentPerformanceTable = ({ agents }: AgentPerformanceTableProps) => {
  if (agents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          Performance par Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-2 px-4 font-medium text-muted-foreground">Agent</th>
              <th className="text-right py-2 px-4 font-medium text-muted-foreground">Visites</th>
              <th className="text-right py-2 px-4 font-medium text-muted-foreground">Ventes</th>
              <th className="text-right py-2 px-4 font-medium text-muted-foreground hidden sm:table-cell">Conversion</th>
              <th className="text-right py-2 px-4 font-medium text-muted-foreground hidden md:table-cell">CA</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a, i) => {
              const conversion = a.visits > 0 ? ((a.deals / a.visits) * 100).toFixed(0) : '—';
              return (
                <tr key={a.agent} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                  <td className="py-2 px-4 font-medium truncate max-w-[120px]">{a.agent}</td>
                  <td className="py-2 px-4 text-right tabular-nums">{a.visits}</td>
                  <td className="py-2 px-4 text-right tabular-nums">
                    <span className={`font-semibold ${a.deals > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {a.deals}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                    {conversion}{typeof conversion === 'string' && conversion !== '—' ? '%' : ''}
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums hidden md:table-cell text-muted-foreground">
                    {a.revenue > 0 ? formatCurrencyFCFA(a.revenue) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceTable;
