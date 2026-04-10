import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/ui/PaginationControls';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuditEntry {
  id: string;
  user_email: string;
  action: string;
  table_name: string;
  record_id: string;
  label: string;
  created_at: string;
}

const ACTION_COLOR: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
};

const TABLE_LABELS: Record<string, string> = {
  clients: 'Clients',
  properties: 'Biens',
  visits: 'Visites',
  agents: 'Agents',
};

const PAGE_SIZE = 25;

const AuditLogViewer = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(PAGE_SIZE);

  const fetchLogs = async (forcePage = pagination.page) => {
    setLoading(true);
    const from = (forcePage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filterAction !== 'all') query = query.eq('action', filterAction);
    if (filterTable !== 'all') query = query.eq('table_name', filterTable);

    const { data, error, count } = await query.range(from, to);
    if (!error) {
      setEntries((data || []) as AuditEntry[]);
      pagination.setTotalCount(count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pagination.page === 1) {
      fetchLogs(1);
    } else {
      pagination.setPage(1);
    }
  }, [filterAction, filterTable]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-primary">Journal d'activité</h1>
        <div className="flex gap-2">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="create">Création</SelectItem>
              <SelectItem value="update">Modification</SelectItem>
              <SelectItem value="delete">Suppression</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="properties">Biens</SelectItem>
              <SelectItem value="visits">Visites</SelectItem>
              <SelectItem value="agents">Agents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && entries.length === 0 && (
        <div className="py-8 text-center text-muted-foreground text-sm">Chargement...</div>
      )}

      {!loading && entries.length === 0 && (
        <div className="py-8 text-center text-muted-foreground text-sm">Aucune entrée dans le journal.</div>
      )}

      {entries.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Utilisateur</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Module</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Élément</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="py-2 px-3 truncate max-w-[120px]">{e.user_email}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLOR[e.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {e.action === 'create' ? 'Création' : e.action === 'update' ? 'Modification' : 'Suppression'}
                    </span>
                  </td>
                  <td className="py-2 px-3 hidden sm:table-cell text-muted-foreground">
                    {TABLE_LABELS[e.table_name] ?? e.table_name}
                  </td>
                  <td className="py-2 px-3 truncate max-w-[200px]">{e.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={pagination.setPage}
      />
    </div>
  );
};

export default AuditLogViewer;
