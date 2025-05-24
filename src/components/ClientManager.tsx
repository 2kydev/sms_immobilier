import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  civilite: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  type: 'acheteur' | 'vendeur' | 'locataire' | 'prospect';
  budget_min?: number;
  budget_max?: number;
  type_bien?: string;
  quartiers?: string[];
  preferred_city?: string;
  dernier_contact: string;
  notes: string;
}

const TYPES_BIEN = [
  'appartement',
  'maison',
  'studio',
  'terrain',
  'local',
  'villa',
  'duplex',
  'loft'
];

const ClientManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = `${client.prenom} ${client.nom} ${client.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'tous' || client.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'acheteur': return 'bg-green-100 text-green-800';
      case 'vendeur': return 'bg-blue-100 text-blue-800';
      case 'locataire': return 'bg-purple-100 text-purple-800';
      case 'prospect': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const openClientDialog = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      form.reset(client);
      setQuartierInputs(client.quartiers || ['']);
      setSelectedTypesBien(client.type_bien ? client.type_bien.split(',') : []);
    } else {
      setSelectedClient(null);
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
    setIsDialogOpen(true);
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
        toast({
          title: "Succès",
          description: "Client mis à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([clientData]);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Client créé avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le client",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gestion des Clients</h1>
        <Button onClick={() => openClientDialog()} className="bg-primary hover:bg-primary/90">
          Nouveau Client
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un client (nom, prénom, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type de client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="acheteur">Acheteurs</SelectItem>
                <SelectItem value="vendeur">Vendeurs</SelectItem>
                <SelectItem value="locataire">Locataires</SelectItem>
                <SelectItem value="prospect">Prospects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{clients.filter(c => c.type === 'acheteur').length}</div>
            <p className="text-sm text-gray-600">Acheteurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{clients.filter(c => c.type === 'vendeur').length}</div>
            <p className="text-sm text-gray-600">Vendeurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{clients.filter(c => c.type === 'locataire').length}</div>
            <p className="text-sm text-gray-600">Locataires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{clients.filter(c => c.type === 'prospect').length}</div>
            <p className="text-sm text-gray-600">Prospects</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="card-hover cursor-pointer" onClick={() => openClientDialog(client)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {client.civilite} {client.prenom} {client.nom}
                </CardTitle>
                <Badge className={getTypeColor(client.type)}>
                  {client.type}
                </Badge>
              </div>
              <CardDescription>{client.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Téléphone:</span> {client.telephone}</p>
                <p><span className="font-medium">Adresse:</span> {client.adresse}</p>
                {client.preferred_city && (
                  <p><span className="font-medium">Ville préférée:</span> {client.preferred_city}</p>
                )}
                {client.quartiers && client.quartiers.length > 0 && (
                  <div>
                    <span className="font-medium">Quartiers:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.quartiers.map((quartier, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {quartier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {client.type_bien && (
                  <div>
                    <span className="font-medium">Types de biens:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.type_bien.split(',').map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {client.budget_min && client.budget_max && (
                  <p><span className="font-medium">Budget:</span> {client.budget_min.toLocaleString()}€ - {client.budget_max.toLocaleString()}€</p>
                )}
                {client.notes && (
                  <p className="text-gray-600 italic">"{client.notes.substring(0, 50)}..."</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour créer/éditer un client */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        <SelectItem value="acheteur">Acheteur</SelectItem>
                        <SelectItem value="vendeur">Vendeur</SelectItem>
                        <SelectItem value="locataire">Locataire</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
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
                    <FormLabel>Ville préférée *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Entrez la ville préférée" />
                    </FormControl>
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
                    <FormLabel>Budget minimum (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 200000"
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
                    <FormLabel>Budget maximum (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 350000"
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManager;
