
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { Control } from 'react-hook-form';
import VisitNotificationEmails from './VisitNotificationEmails';

interface Agent {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

interface Visit {
  id: string;
  client_id?: string;
  property_id?: string;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  propriete_titre: string;
  propriete_adresse: string;
  date: string;
  heure: string;
  statut: 'planifiee' | 'realisee' | 'annulee' | 'reportee';
  agent: string;
  notes?: string;
  feedback_client?: string;
  notification_enabled?: boolean;
  notification_delay_hours?: number;
  notification_email?: string;
  agent_notification_email?: string;
  client_notification_email?: string;
}

interface VisitNotificationSectionProps {
  control: Control<Visit>;
  agents: Agent[];
  clients: Client[];
  notificationEnabled: boolean;
}

const VisitNotificationSection: React.FC<VisitNotificationSectionProps> = ({
  control,
  agents,
  clients,
  notificationEnabled
}) => {
  return (
    <div className="md:col-span-2 border-t pt-4">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5" />
        Notifications Email
      </h3>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="notification_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Activer les notifications</FormLabel>
                <div className="text-[0.8rem] text-muted-foreground">
                  Envoyer un rappel par email
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {notificationEnabled && (
          <>
            <FormField
              control={control}
              name="notification_delay_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Délai de notification</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Délai" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 heure avant</SelectItem>
                      <SelectItem value="24">1 jour avant</SelectItem>
                      <SelectItem value="48">2 jours avant</SelectItem>
                      <SelectItem value="72">3 jours avant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <VisitNotificationEmails
              control={control}
              agents={agents}
              clients={clients}
              notificationEnabled={notificationEnabled}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VisitNotificationSection;
