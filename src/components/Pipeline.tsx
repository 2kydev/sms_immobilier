import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: number;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  propriete: string;
  valeur: number;
  etape: 'prospect' | 'visite' | 'offre' | 'negociation' | 'compromis' | 'finalise';
  agent: string;
  dateCreation: string;
  derniereActivite: string;
  notes: string;
  probabilite: number;
}

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

interface Property {
  id: string;
  titre: string;
  prix: number;
  adresse: string;
}

const Pipeline = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      clientNom: 'Martin',
      clientPrenom: 'Jean',
      clientTelephone: '06 12 34 56 78',
      propriete: 'Appartement 3P - République',
      valeur: 425000,
      etape: 'visite',
      agent: 'Marie Dupont',
      dateCreation: '2024-05-15',
      derniereActivite: '2024-05-22',
      notes: 'Client très motivé, recherche activement',
      probabilite: 75
    },
    {
      id: 2,
      clientNom: 'Bernard',
      clientPrenom: 'Sophie',
      clientTelephone: '06 98 76 54 32',
      propriete: 'Maison 5P - Antony',
      valeur: 650000,
      etape: 'negociation',
      agent: 'Pierre Leroy',
      dateCreation: '2024-05-10',
      derniereActivite: '2024-05-23',
      notes: 'Négociation en cours sur le prix',
      probabilite: 60
    },
    {
      id: 3,
      clientNom: 'Dubois',
      clientPrenom: 'Thomas',
      clientTelephone: '06 55 44 33 22',
      propriete: 'Studio - Université',
      valeur: 180000,
      etape: 'prospect',
      agent: 'Marie Dupont',
      dateCreation: '2024-05-20',
      derniereActivite: '2024-05-20',
      notes: 'Premier contact, à relancer',
      probabilite: 25
    }
  ]);

  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const { toast } = useToast();

  const etapes = [
    { key: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-800' },
    { key: 'visite', label: 'Visite programmée', color: 'bg-blue-100 text-blue-800' },
    { key: 'offre', label: 'Offre', color: 'bg-purple-100 text-purple-800' },
    { key: 'negociation', label: 'Négociation', color: 'bg-orange-100 text-orange-800' },
    { key: 'compromis', label: 'Compromis', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'finalise', label: 'Vente finalisée', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    fetchClients();
    fetchProperties();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, telephone')
        .order('nom');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, titre, prix, adresse')
        .eq('statut', 'disponible')
        .order('titre');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les propriétés",
        variant: "destructive"
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getSelectedClient = () => {
    return clients.find(client => client.id === selectedClientId);
  };

  const getSelectedProperty = () => {
    return properties.find(property => property.id === selectedPropertyId);
  };

  const getTransactionsByEtape = (etape: string) => {
    return transactions.filter(t => t.etape === etape);
  };

  const getTotalValueByEtape = (etape: string) => {
    return getTransactionsByEtape(etape).reduce((sum, t) => sum + t.valeur, 0);
  };

  const moveTransaction = (transactionId: number, newEtape: string) => {
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, etape: newEtape as any, derniereActivite: new Date().toISOString().split('T')[0] }
          : t
      )
    );
  };

  const openTransactionDialog = (transaction?: Transaction) => {
    if (transaction) {
      setSelectedTransaction(transaction);
      // Find corresponding client and property IDs if editing
      const client = clients.find(c => c.nom === transaction.clientNom && c.prenom === transaction.clientPrenom);
      const property = properties.find(p => p.titre === transaction.propriete);
      setSelectedClientId(client?.id || '');
      setSelectedPropertyId(property?.id || '');
    } else {
      setSelectedTransaction({
        id: 0,
        clientNom: '',
        clientPrenom: '',
        clientTelephone: '',
        propriete: '',
        valeur: 0,
        etape: 'prospect',
        agent: 'Marie Dupont',
        dateCreation: new Date().toISOString().split('T')[0],
        derniereActivite: new Date().toISOString().split('T')[0],
        notes: '',
        probabilite: 25
      });
      setSelectedClientId('');
      setSelectedPropertyId('');
    }
    setIsDialogOpen(true);
  };

  const getDaysInStage = (dateActivite: string) => {
    const today = new Date();
    const activityDate = new Date(dateActivite);
    const diffTime = Math.abs(today.getTime() - activityDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Pipeline des Transactions</h1>
        <Button onClick={() => openTransactionDialog()} className="bg-primary hover:bg-primary/90">
          Nouvelle Transaction
        </Button>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{transactions.length}</div>
            <p className="text-sm text-gray-600">Transactions actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(transactions.reduce((sum, t) => sum + t.valeur, 0))}
            </div>
            <p className="text-sm text-gray-600">Valeur totale pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(transactions.reduce((sum, t) => sum + t.probabilite, 0) / transactions.length)}%
            </div>
            <p className="text-sm text-gray-600">Probabilité moyenne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(Math.round(transactions.reduce((sum, t) => sum + (t.valeur * t.probabilite / 100), 0)))}
            </div>
            <p className="text-sm text-gray-600">Valeur pondérée</p>
          </CardContent>
        </Card>
      </div>

      {/* Vue Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {etapes.map((etape) => {
          const transactionsEtape = getTransactionsByEtape(etape.key);
          const valeurTotale = getTotalValueByEtape(etape.key);
          
          return (
            <Card key={etape.key} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{etape.label}</CardTitle>
                  <Badge className={etape.color}>
                    {transactionsEtape.length}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {formatAmount(valeurTotale)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {transactionsEtape.map((transaction) => (
                  <Card 
                    key={transaction.id} 
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
                    onClick={() => openTransactionDialog(transaction)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {transaction.clientPrenom} {transaction.clientNom}
                        </p>
                        <span className="text-xs text-gray-500">
                          {getDaysInStage(transaction.derniereActivite)}j
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {transaction.propriete}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          {formatAmount(transaction.valeur)}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{transaction.probabilite}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{transaction.agent}</span>
                        <span>{transaction.clientTelephone}</span>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {transactionsEtape.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-4">
                    Aucune transaction
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog pour créer/éditer une transaction */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction?.id ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </DialogTitle>
            <DialogDescription>
              Gérez les détails de la transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientSelect">Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.prenom} {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientTelephone">Téléphone</Label>
                <Input 
                  id="clientTelephone" 
                  value={getSelectedClient()?.telephone || ''} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="proprieteSelect">Propriété</Label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une propriété" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.titre} - {property.adresse} - {formatAmount(property.prix)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valeur">Montant (FCFA)</Label>
                <Input 
                  id="valeur" 
                  type="number" 
                  value={getSelectedProperty()?.prix || selectedTransaction.valeur || ''} 
                  readOnly={!!getSelectedProperty()}
                  className={getSelectedProperty() ? "bg-gray-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent">Agent responsable</Label>
                <Select defaultValue={selectedTransaction.agent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marie Dupont">Marie Dupont</SelectItem>
                    <SelectItem value="Pierre Leroy">Pierre Leroy</SelectItem>
                    <SelectItem value="Sophie Martin">Sophie Martin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="etape">Étape actuelle</Label>
                <Select defaultValue={selectedTransaction.etape}>
                  <SelectTrigger>
                    <SelectValue placeholder="Étape" />
                  </SelectTrigger>
                  <SelectContent>
                    {etapes.map((etape) => (
                      <SelectItem key={etape.key} value={etape.key}>
                        {etape.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="derniereActivite">Dernière activité</Label>
                <Input id="derniereActivite" type="date" defaultValue={selectedTransaction.derniereActivite} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Notes sur la transaction..." defaultValue={selectedTransaction.notes} />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  {selectedTransaction.id ? 'Mettre à jour' : 'Créer'}
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

export default Pipeline;
