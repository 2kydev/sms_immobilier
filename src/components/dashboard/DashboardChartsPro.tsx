import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { TransactionPipeline, EnhancedDashboardData } from '@/types/enhancedDashboard';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';
interface DashboardChartsProProps {
  transactionPipeline: TransactionPipeline;
  monthlyData: EnhancedDashboardData['monthlyData'];
  clientsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}
const DashboardChartsPro = ({
  transactionPipeline,
  monthlyData,
  clientsByType
}: DashboardChartsProProps) => {
  // Pipeline data for funnel chart
  const pipelineData = [{
    name: 'Prospection',
    count: transactionPipeline.prospection,
    color: '#3b82f6'
  }, {
    name: 'Qualification',
    count: transactionPipeline.qualification,
    color: '#8b5cf6'
  }, {
    name: 'Négociation',
    count: transactionPipeline.negotiation,
    color: '#f59e0b'
  }, {
    name: 'Signature',
    count: transactionPipeline.signature,
    color: '#10b981'
  }, {
    name: 'Finalisé',
    count: transactionPipeline.finalise,
    color: '#059669'
  }];

  // Colors for client types
  const clientColors = ['#1e40af', '#b59f3b', '#6b7280', '#dc2626', '#059669'];
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium text-card-foreground">{label}</p>
          {payload.map((entry: any, index: number) => <p key={index} className="text-sm" style={{
          color: entry.color
        }}>
              {entry.dataKey === 'revenue' ? `${entry.name}: ${formatCurrencyFCFA(entry.value)}` : `${entry.name}: ${entry.value}`}
            </p>)}
        </div>;
    }
    return null;
  };
  return;
};
export default DashboardChartsPro;