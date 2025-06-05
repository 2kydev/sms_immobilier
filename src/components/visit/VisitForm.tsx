
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import VisitNotificationSection from './VisitNotificationSection';

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

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

interface Property {
  id: string;
  titre: string;
  type: string;
  surface: number;
  pieces: number;
  prix: number;
  city: string;
  quartier: string;
}

interface Agent {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

interface VisitFormProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<Visit>;
  onSubmit: (data: Visit) => void;
  selectedVisit: Visit | null;
  clients: Client[];
  properties: Property[];
  agents: Agent[];
  onClientSelect: (clientId: string) => void;
  onPropertySelect: (propertyId: string) => void;
  onAgentSelect: (agentName: string) => void;
}

const VisitForm: React.FC<VisitFormProps> = ({
  isOpen,
  onClose,
  form,
  onSubmit,
  selectedVisit,
  clients,
  properties,
  agents,
  onClientSelect,
  onPropertySelect,
  onAgentSelect
}) => {
  const formatPropertyOption = (property: Property) => {
    return `${property.type} - ${property.surface}m² - ${property.pieces} pièces - ${property.city}, ${property.quartier} - ${property.prix.toLocaleString()}FCFA`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedVisit ? 'Modifier la visite' : 'Nouvelle visite'}
          </DialogTitle>
          <DialogDescription>
            Programmez une visite avec un client
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélection du client */}
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Client *</FormLabel>
                  <Select onValueChange={onClientSelect} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.prenom} {client.nom} - {client.telephone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sélection de la propriété */}
            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Propriété à visiter *</FormLabel>
                  <Select onValueChange={onPropertySelect} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une propriété" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {formatPropertyOption(property)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="heure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planifiee">Planifiée</SelectItem>
                      <SelectItem value="realisee">Réalisée</SelectItem>
                      <SelectItem value="annulee">Annulée</SelectItem>
                      <SelectItem value="reportee">Reportée</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent responsable</FormLabel>
                  <Select onValueChange={onAgentSelect} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un agent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.nom}>
                          {agent.nom} - {agent.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section Notifications Email */}
            <VisitNotificationSection
              control={form.control}
              agents={agents}
              clients={clients}
              notificationEnabled={form.watch('notification_enabled')}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes sur la visite..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('statut') === 'realisee' && (
              <FormField
                control={form.control}
                name="feedback_client"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Feedback du client</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Retour du client après la visite..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="md:col-span-2 flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {selectedVisit ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VisitForm;
