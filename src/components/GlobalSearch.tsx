import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Building2, Users, Calendar, Home, Settings, UserPlus, BadgeEuro } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  category: 'property' | 'client' | 'visit';
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: Home, path: '/' },
  { label: 'Gestion des biens', icon: Building2, path: '/property-management' },
  { label: 'Biens à vendre', icon: BadgeEuro, path: '/properties-for-sale' },
  { label: 'Clients', icon: Users, path: '/?tab=clients' },
  { label: 'Visites', icon: Calendar, path: '/?tab=visits' },
  { label: 'Agents', icon: UserPlus, path: '/?tab=agents' },
  { label: 'Utilisateurs', icon: Settings, path: '/?tab=users' },
  { label: 'Journal d\'activité', icon: Settings, path: '/?tab=audit' },
];

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [properties, setProperties] = useState<SearchResult[]>([]);
  const [clients, setClients] = useState<SearchResult[]>([]);
  const [visits, setVisits] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canAccessDashboard, isAdmin } = useRole();

  // Debounce: wait 300ms after last keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setProperties([]);
      setClients([]);
      setVisits([]);
      return;
    }
    search(debouncedQuery);
  }, [debouncedQuery]);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    const term = `%${q}%`;

    const [propRes, clientRes, visitRes] = await Promise.all([
      supabase
        .from('properties')
        .select('id, titre, city, quartier, prix, statut, transaction_type')
        .or(`titre.ilike.${term},city.ilike.${term},quartier.ilike.${term},adresse.ilike.${term}`)
        .limit(5),
      supabase
        .from('clients')
        .select('id, nom, prenom, telephone, type')
        .or(`nom.ilike.${term},prenom.ilike.${term},email.ilike.${term},telephone.ilike.${term}`)
        .limit(5),
      supabase
        .from('visits')
        .select('id, client_nom, client_prenom, propriete_titre, date, statut')
        .or(`client_nom.ilike.${term},client_prenom.ilike.${term},propriete_titre.ilike.${term}`)
        .limit(5),
    ]);

    setProperties(
      (propRes.data || []).map(p => ({
        id: p.id,
        category: 'property',
        label: p.titre,
        sublabel: `${p.city} · ${p.prix?.toLocaleString()} F · ${p.statut}`,
      }))
    );
    setClients(
      (clientRes.data || []).map(c => ({
        id: c.id,
        category: 'client',
        label: `${c.prenom} ${c.nom}`,
        sublabel: `${c.telephone} · ${c.type}`,
      }))
    );
    setVisits(
      (visitRes.data || []).map(v => ({
        id: v.id,
        category: 'visit',
        label: `${v.client_prenom} ${v.client_nom}`,
        sublabel: `${v.propriete_titre} · ${new Date(v.date).toLocaleDateString('fr-FR')}`,
      }))
    );
    setLoading(false);
  }, []);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = properties.length > 0 || clients.length > 0 || visits.length > 0;
  const showNav = !debouncedQuery || debouncedQuery.length < 2;

  const visibleNav = NAV_ITEMS.filter(item => {
    if (item.path === '/' && !canAccessDashboard()) return false;
    if ((item.path.includes('tab=agents') || item.path.includes('tab=users')) && !isAdmin()) return false;
    return true;
  });

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher un bien, client, visite..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {/* Navigation rapide quand champ vide */}
        {showNav && (
          <CommandGroup heading="Navigation">
            {visibleNav.map(item => (
              <CommandItem
                key={item.path}
                value={item.label}
                onSelect={() => handleSelect(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Résultats de recherche */}
        {!showNav && !loading && !hasResults && (
          <CommandEmpty>Aucun résultat pour « {debouncedQuery} »</CommandEmpty>
        )}

        {!showNav && loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">Recherche...</div>
        )}

        {properties.length > 0 && (
          <>
            <CommandGroup heading="Propriétés">
              {properties.map(p => (
                <CommandItem
                  key={p.id}
                  value={`property-${p.id}-${p.label}`}
                  onSelect={() => handleSelect('/property-management')}
                >
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{p.label}</div>
                    {p.sublabel && (
                      <div className="text-xs text-muted-foreground truncate">{p.sublabel}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {clients.length > 0 && (
          <>
            <CommandGroup heading="Clients">
              {clients.map(c => (
                <CommandItem
                  key={c.id}
                  value={`client-${c.id}-${c.label}`}
                  onSelect={() => handleSelect('/?tab=clients')}
                >
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{c.label}</div>
                    {c.sublabel && (
                      <div className="text-xs text-muted-foreground truncate">{c.sublabel}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {visits.length > 0 && (
          <CommandGroup heading="Visites">
            {visits.map(v => (
              <CommandItem
                key={v.id}
                value={`visit-${v.id}-${v.label}`}
                onSelect={() => handleSelect('/?tab=visits')}
              >
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{v.label}</div>
                  {v.sublabel && (
                    <div className="text-xs text-muted-foreground truncate">{v.sublabel}</div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
