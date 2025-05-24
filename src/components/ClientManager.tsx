
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Client {
  id: number;
  civilite: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  type: 'acheteur' | 'vendeur' | 'locataire' | 'prospect';
  budgetMin?: number;
  budgetMax?: number;
  typeBien?: string;
  quartiers?: string[];
  dernierContact: string;
  notes: string;
}

const ClientManager = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      civilite: 'M.',
      nom: 'Martin',
      prenom: 'Jean',
      telephone: '06 12 34 56 78',
      email: 'jean.martin@email.com',
      adresse: '15 rue de la Paix, 75001 Paris',
      type: 'acheteur',
      budgetMin: 300000,
      budgetMax: 450000,
      typeBien: 'Appartement',
      quartiers: ['Centre-ville', 'Quartier Latin'],
      dernierContact: '2024-05-20',
      notes: 'Recherche un 3 pièces avec balcon'
    },
    {
      id: 2,
      civilite: 'Mme',
      nom: 'Bernard',
      prenom: 'Sophie',
      telephone: '06 98 76 54 32',
      email: 'sophie.bernard@email.com',
      adresse: '8 avenue des Champs, 75008 Paris',
      type: 'vendeur',
      dernierContact: '2024-05-18',
      notes: 'Souhaite vendre maison familiale'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const openClientDialog = (client?: Client) => {
    setSelectedClient(client || {
      id: 0,
      civilite: '',
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      adresse: '',
      type: 'prospect',
      dernierContact: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsDialogOpen(true);
  };

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
                {client.budgetMin && client.budgetMax && (
                  <p><span className="font-medium">Budget:</span> {client.budgetMin.toLocaleString()}€ - {client.budgetMax.toLocaleString()}€</p>
                )}
                <p><span className="font-medium">Dernier contact:</span> {new Date(client.dernierContact).toLocaleDateString('fr-FR')}</p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClient?.id ? 'Modifier le client' : 'Nouveau client'}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations du client
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="civilite">Civilité</Label>
                <Select defaultValue={selectedClient.civilite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Civilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M.">M.</SelectItem>
                    <SelectItem value="Mme">Mme</SelectItem>
                    <SelectItem value="Mlle">Mlle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de client</Label>
                <Select defaultValue={selectedClient.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acheteur">Acheteur</SelectItem>
                    <SelectItem value="vendeur">Vendeur</SelectItem>
                    <SelectItem value="locataire">Locataire</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" defaultValue={selectedClient.nom} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" defaultValue={selectedClient.prenom} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" defaultValue={selectedClient.telephone} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={selectedClient.email} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" defaultValue={selectedClient.adresse} />
              </div>

              {(selectedClient.type === 'acheteur' || selectedClient.type === 'locataire') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Budget minimum (€)</Label>
                    <Input id="budgetMin" type="number" defaultValue={selectedClient.budgetMin} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Budget maximum (€)</Label>
                    <Input id="budgetMax" type="number" defaultValue={selectedClient.budgetMax} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeBien">Type de bien recherché</Label>
                    <Select defaultValue={selectedClient.typeBien}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de bien" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Appartement">Appartement</SelectItem>
                        <SelectItem value="Maison">Maison</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                        <SelectItem value="Terrain">Terrain</SelectItem>
                        <SelectItem value="Local commercial">Local commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quartiers">Quartiers préférés</Label>
                    <Input id="quartiers" placeholder="Séparez par des virgules" defaultValue={selectedClient.quartiers?.join(', ')} />
                  </div>
                </>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Notes et commentaires..." defaultValue={selectedClient.notes} />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  {selectedClient.id ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManager;
