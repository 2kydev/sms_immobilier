import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAction } from '@/services/auditService';
import { Client, TYPES_BIEN } from './types';
import { CI_CITIES, CI_CLIENT_TYPES } from '@/constants/coteIvoire';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient: Client | null;
  onSuccess: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  selectedClient,
  onSuccess
}) => {
  const [quartierInputs, setQuartierInputs] = useState<string[]>(['']);
  const [selectedTypesBien, setSelectedTypesBien] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<Client>({
    defaultValues: {
      civilite: '',
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      adresse: '',
      type: 'prospect',
      preferred_city: '',
      dernier_contact: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  React.useEffect(() => {
    if (selectedClient) {
      form.reset(selectedClient);
      setQuartierInputs(selectedClient.quartiers || ['']);
      setSelectedTypesBien(selectedClient.type_bien ? selectedClient.type_bien.split(',') : []);
    } else {
      form.reset({
        civilite: '',
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        adresse: '',
        type: 'prospect',
        preferred_city: '',
        dernier_contact: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setQuartierInputs(['']);
      setSelectedTypesBien([]);
    }
  }, [selectedClient, form]);

  const addQuartierInput = () => {
    setQuartierInputs([...quartierInputs, '']);
  };

  const removeQuartierInput = (index: number) => {
    if (quartierInputs.length > 1) {
      setQuartierInputs(quartierInputs.filter((_, i) => i !== index));
    }
  };

  const updateQuartierInput = (index: number, value: string) => {
    const newInputs = [...quartierInputs];
    newInputs[index] = value;
    setQuartierInputs(newInputs);
  };

  const handleTypeBienChange = (typeBien: string, checked: boolean) => {
    if (checked) {
      setSelectedTypesBien([...selectedTypesBien, typeBien]);
    } else {
      setSelectedTypesBien(selectedTypesBien.filter(type => type !== typeBien));
    }
  };

  const onSubmit = async (data: Client) => {
    try {
      const quartiers = quartierInputs.filter(q => q.trim() !== '');
      const clientData = {
        ...data,
        quartiers,
        budget_min: data.budget_min || null,
        budget_max: data.budget_max || null,
        type_bien: selectedTypesBien.length > 0 ? selectedTypesBien.join(',') : null
      };

      if (selectedClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', selectedClient.id);

        if (error) throw error;
        logAction({ action: 'update', table: 'clients', recordId: selectedClient.id, label: `${data.prenom} ${data.nom}` });
        toast({
          title: "Succès",
          description: "Client mis à jour avec succès"
        });
      } else {
        const { data: inserted, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select('id')
          .single();

        if (error) throw error;
        if (inserted) logAction({ action: 'create', table: 'clients', recordId: inserted.id, label: `${data.prenom} ${data.nom}` });
        toast({
          title: "Succès",
          description: "Client créé avec succès"
        });
      }

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le client",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedClient ? 'Modifier le client' : 'Nouveau client'}
          </DialogTitle>
          <DialogDescription>
            Renseignez les informations du client
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="civilite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Civilité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Civilité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M.">M.</SelectItem>
                      <SelectItem value="Mme">Mme</SelectItem>
                      <SelectItem value="Mlle">Mlle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CI_CLIENT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nom"
              rules={{ required: "Le nom est obligatoire" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prenom"
              rules={{ required: "Le prénom est obligatoire" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_city"
              rules={{ required: "La ville préférée est obligatoire" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville / Commune préférée *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CI_CITIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quartiers préférés */}
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Quartiers préférés</Label>
              <div className="space-y-2 mt-2">
                {quartierInputs.map((quartier, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={quartier}
                      onChange={(e) => updateQuartierInput(index, e.target.value)}
                      placeholder={`Quartier ${index + 1}`}
                      className="flex-1"
                    />
                    {quartierInputs.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuartierInput(index)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuartierInput}
                >
                  Ajouter un quartier
                </Button>
              </div>
            </div>

            {/* Types de biens préférés */}
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Types de biens recherchés</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {TYPES_BIEN.map((typeBien) => (
                  <div key={typeBien} className="flex items-center space-x-2">
                    <Checkbox
                      id={typeBien}
                      checked={selectedTypesBien.includes(typeBien)}
                      onCheckedChange={(checked) => handleTypeBienChange(typeBien, checked as boolean)}
                    />
                    <Label htmlFor={typeBien} className="text-sm capitalize">
                      {typeBien}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget */}
            <FormField
              control={form.control}
              name="budget_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget minimum (FCFA)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ex: 20000000"
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget maximum (FCFA)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ex: 35000000"
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes et commentaires..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {selectedClient ? 'Mettre à jour' : 'Créer'}
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

export default ClientForm;
