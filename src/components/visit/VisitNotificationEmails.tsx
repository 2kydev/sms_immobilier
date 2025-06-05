
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';

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

interface VisitNotificationEmailsProps {
  control: Control<Visit>;
  agents: Agent[];
  clients: Client[];
  notificationEnabled: boolean;
}

const VisitNotificationEmails: React.FC<VisitNotificationEmailsProps> = ({
  control,
  agents,
  clients,
  notificationEnabled
}) => {
  if (!notificationEnabled) return null;

  // Filter agents and clients to only include those with valid email addresses
  const validAgents = agents.filter(agent => agent.statut === 'actif' && agent.email && agent.email.trim() !== '');
  const validClients = clients.filter(client => client.email && client.email.trim() !== '');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <FormField
        control={control}
        name="agent_notification_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Agent</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un agent" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {validAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.email}>
                    {agent.nom} - {agent.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="client_notification_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Client</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {validClients.map((client) => (
                  <SelectItem key={client.id} value={client.email}>
                    {client.prenom} {client.nom} - {client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VisitNotificationEmails;
