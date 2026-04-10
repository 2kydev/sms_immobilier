import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import ClientStats from './client/ClientStats';
import ClientFilters from './client/ClientFilters';
import ClientCard from './client/ClientCard';
import ClientForm from './client/ClientForm';
import { ClientMatchingDialog } from './client/ClientMatchingDialog';
import PaginationControls from '@/components/ui/PaginationControls';
import { Client } from './client/types';
import { Card, CardContent } from '@/components/ui/card';

const PAGE_SIZE = 12;

const ClientManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientStats, setClientStats] = useState({ total: 0, acheteur: 0, vendeur: 0, locataire: 0, prospect: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [matchingClient, setMatchingClient] = useState<Client | null>(null);
  const [isMatchingOpen, setIsMatchingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const pagination = usePagination(PAGE_SIZE);

  // Lightweight stats query — always reflects ALL clients (no pagination)
  const fetchStats = async () => {
    const { data } = await supabase.from('clients').select('type');
    if (!data) return;
    setClientStats({
      total: data.length,
      acheteur: data.filter(c => c.type === 'acheteur').length,
      vendeur: data.filter(c => c.type === 'vendeur').length,
      locataire: data.filter(c => c.type === 'locataire').length,
      prospect: data.filter(c => c.type === 'prospect').length,
    });
  };

  const fetchClients = async (forcePage = pagination.page) => {
    setLoading(true);
    const from = (forcePage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      let query = supabase.from('clients').select('*', { count: 'exact' });
      if (searchTerm) {
        query = query.or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      if (filterType !== 'tous') query = query.eq('type', filterType);

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      pagination.setTotalCount(count ?? 0);
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
    fetchStats();
  }, []);

  useEffect(() => {
    fetchClients();
  }, [pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pagination.page === 1) {
      fetchClients(1);
    } else {
      pagination.setPage(1);
    }
  }, [searchTerm, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  const openClientDialog = (client?: Client) => {
    setSelectedClient(client || null);
    setIsDialogOpen(true);
  };

  const closeClientDialog = () => {
    setIsDialogOpen(false);
    setSelectedClient(null);
  };

  const handleSuccess = () => {
    fetchClients(1);
    fetchStats();
    if (pagination.page !== 1) pagination.setPage(1);
  };

  if (loading && clients.length === 0) {
    return <div className="p-6">Chargement des clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-primary">Gestion des Clients</h1>
          <Card>
          </Card>
        </div>
        <Button onClick={() => openClientDialog()} className="bg-primary hover:bg-primary/90">
          Nouveau Client
        </Button>
      </div>

      <ClientFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterType={filterType} setFilterType={setFilterType} />

      <ClientStats stats={clientStats} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => openClientDialog(client)}
            onMatchClick={(e) => { e.stopPropagation(); setMatchingClient(client); setIsMatchingOpen(true); }}
          />
        ))}
        {clients.length === 0 && !loading && (
          <p className="col-span-3 text-center py-8 text-muted-foreground">
            Aucun client trouvé avec ces critères
          </p>
        )}
      </div>

      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={pagination.setPage}
      />

      <ClientForm isOpen={isDialogOpen} onClose={closeClientDialog} selectedClient={selectedClient} onSuccess={handleSuccess} />

      <ClientMatchingDialog
        client={matchingClient}
        open={isMatchingOpen}
        onOpenChange={(v) => { setIsMatchingOpen(v); if (!v) setMatchingClient(null); }}
      />
    </div>
  );
};

export default ClientManager;
