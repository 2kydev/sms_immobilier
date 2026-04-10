import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, BadgeEuro, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from './types';

interface MatchedProperty {
  id: string;
  titre: string;
  city: string;
  quartier: string;
  prix: number;
  type: string;
  surface: number;
  pieces: number;
  statut: string;
  transaction_type: string;
  // computed
  budgetMatch: boolean;
  cityMatch: boolean;
  typeMatch: boolean;
  quartierMatch: boolean;
  score: number;
}

interface ClientMatchingDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getTransactionType(clientType: string): string | null {
  if (clientType === 'acheteur' || clientType === 'prospect') return 'vente';
  if (clientType === 'locataire') return 'location';
  return null;
}

export function ClientMatchingDialog({ client, open, onOpenChange }: ClientMatchingDialogProps) {
  const [properties, setProperties] = useState<MatchedProperty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !client) return;
    fetchMatches();
  }, [open, client]);

  const fetchMatches = async () => {
    if (!client) return;
    setLoading(true);

    const transactionType = getTransactionType(client.type);
    if (!transactionType) {
      setProperties([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from('properties')
      .select('id, titre, city, quartier, prix, type, surface, pieces, statut, transaction_type')
      .eq('statut', 'disponible')
      .eq('transaction_type', transactionType)
      .order('prix', { ascending: true })
      .limit(20);

    const { data, error } = await query;
    if (error || !data) {
      setLoading(false);
      return;
    }

    const clientTypes = client.type_bien
      ? client.type_bien.split(',').map(t => t.trim().toLowerCase())
      : [];
    const clientQuartiers = (client.quartiers || []).map(q => q.trim().toLowerCase());

    const scored = data.map(p => {
      const budgetMatch =
        (!client.budget_min || p.prix >= client.budget_min) &&
        (!client.budget_max || p.prix <= client.budget_max);
      const cityMatch = !client.preferred_city ||
        p.city.toLowerCase() === client.preferred_city.toLowerCase();
      const typeMatch = clientTypes.length === 0 ||
        clientTypes.includes(p.type.toLowerCase());
      const quartierMatch = clientQuartiers.length === 0 ||
        clientQuartiers.some(q => p.quartier.toLowerCase().includes(q));

      const score = (budgetMatch ? 3 : 0) + (cityMatch ? 2 : 0) + (typeMatch ? 2 : 0) + (quartierMatch ? 1 : 0);

      return { ...p, budgetMatch, cityMatch, typeMatch, quartierMatch, score };
    });

    // Sort by score desc, show top 10
    scored.sort((a, b) => b.score - a.score);
    setProperties(scored.slice(0, 10));
    setLoading(false);
  };

  if (!client) return null;

  const transactionType = getTransactionType(client.type);
  const noMatchSupported = !transactionType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Biens correspondants — {client.prenom} {client.nom}
          </DialogTitle>
          <DialogDescription>
            {noMatchSupported
              ? 'Les vendeurs n\'ont pas de matching automatique.'
              : `Biens disponibles à la ${transactionType} correspondant au profil du client`}
          </DialogDescription>
        </DialogHeader>

        {noMatchSupported && (
          <p className="text-muted-foreground text-sm py-4 text-center">
            Le matching est disponible pour les acheteurs, prospects et locataires.
          </p>
        )}

        {!noMatchSupported && loading && (
          <div className="py-8 text-center text-sm text-muted-foreground">Recherche en cours...</div>
        )}

        {!noMatchSupported && !loading && properties.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aucun bien disponible ne correspond aux critères de ce client.
          </div>
        )}

        {!noMatchSupported && !loading && properties.length > 0 && (
          <div className="space-y-3 mt-2">
            {/* Client criteria summary */}
            <div className="bg-muted/40 rounded-lg p-3 text-xs flex flex-wrap gap-2">
              {client.budget_min && <span className="text-muted-foreground">Budget min: <strong>{client.budget_min.toLocaleString()} F</strong></span>}
              {client.budget_max && <span className="text-muted-foreground">Budget max: <strong>{client.budget_max.toLocaleString()} F</strong></span>}
              {client.preferred_city && <span className="text-muted-foreground">Ville: <strong>{client.preferred_city}</strong></span>}
              {client.type_bien && <span className="text-muted-foreground">Types: <strong>{client.type_bien}</strong></span>}
              {client.quartiers && client.quartiers.length > 0 && (
                <span className="text-muted-foreground">Quartiers: <strong>{client.quartiers.join(', ')}</strong></span>
              )}
            </div>

            {properties.map(p => (
              <div key={p.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{p.titre}</span>
                  </div>
                  <Badge variant={p.score >= 6 ? 'default' : p.score >= 3 ? 'secondary' : 'outline'} className="shrink-0 text-xs">
                    {p.score >= 6 ? 'Excellent' : p.score >= 3 ? 'Bon' : 'Partiel'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {p.quartier}, {p.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <BadgeEuro className="h-3 w-3" />
                    {p.prix.toLocaleString()} F
                  </span>
                  <span>{p.type} · {p.surface} m² · {p.pieces} pièces</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <MatchBadge ok={p.budgetMatch} label="Budget" />
                  <MatchBadge ok={p.cityMatch} label="Ville" />
                  <MatchBadge ok={p.typeMatch} label="Type" />
                  <MatchBadge ok={p.quartierMatch} label="Quartier" />
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MatchBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
      {ok
        ? <CheckCircle2 className="h-3 w-3" />
        : <XCircle className="h-3 w-3" />
      }
      {label}
    </span>
  );
}
