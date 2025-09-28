import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';
import { DashboardAlerts as AlertsType } from '@/types/enhancedDashboard';
import { getTimeAgo } from '@/utils/timeUtils';
interface DashboardAlertsProps {
  alerts: AlertsType[];
}
const DashboardAlerts = ({
  alerts
}: DashboardAlertsProps) => {
  const getAlertIcon = (type: AlertsType['type']) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'success':
        return CheckCircle;
      case 'info':
      default:
        return Info;
    }
  };
  const getAlertVariant = (type: AlertsType['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'default';
    }
  };
  const getPriorityColor = (priority: AlertsType['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  if (alerts.length === 0) {
    return;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertes & Notifications
          <Badge variant="secondary" className="ml-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map(alert => {
        const Icon = getAlertIcon(alert.type);
        return <Alert key={alert.id} variant={getAlertVariant(alert.type)} className="border-l-4">
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTitle className="text-sm font-medium">
                      {alert.title}
                    </AlertTitle>
                    <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                      {alert.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {getTimeAgo(alert.createdAt)}
                    </span>
                  </div>
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>;
      })}
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Surveillez régulièrement ces indicateurs pour optimiser vos performances</span>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default DashboardAlerts;