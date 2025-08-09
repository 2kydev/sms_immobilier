import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImmeubleTableProps {
  onCreate: () => void;
}

type ImmeubleRow = {
  id: string;
  titre: string;
  surface: number;
  city: string;
  quartier: string;
  prix: number;
  created_at: string;
};

const ImmeubleTable: React.FC<ImmeubleTableProps> = ({ onCreate }) => {
  const [rows, setRows] = useState<ImmeubleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchImmeubles = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("id, titre, surface, city, quartier, prix, created_at")
          .eq("type", "immeuble")
          .eq("transaction_type", "vente")
          .eq("statut", "disponible")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRows((data as ImmeubleRow[]) || []);
      } catch (err) {
        console.error(err);
        toast({ title: "Erreur", description: "Impossible de charger les immeubles", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchImmeubles();
  }, [toast]);

  const recap = useMemo(() => {
    const total = rows.length;
    const totalValue = rows.reduce((acc, r) => acc + (r.prix || 0), 0);
    return { total, totalValue };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Récapitulatif des immeubles</h2>
          <p className="text-muted-foreground">Liste des immeubles actuellement en vente</p>
        </div>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nouvel immeuble
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total des immeubles</CardTitle>
            <CardDescription>Nombre total d’immeubles en vente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recap.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valeur totale</CardTitle>
            <CardDescription>Somme des prix (FCFA)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recap.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Immeubles</CardTitle>
          <CardDescription>Tableau récapitulatif des immeubles à vendre</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Aucun immeuble trouvé</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Superficie (m²)</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Prix (FCFA)</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.titre}</TableCell>
                    <TableCell>{r.surface?.toLocaleString()}</TableCell>
                    <TableCell>
                      {r.city}
                      {r.quartier ? `, ${r.quartier}` : ""}
                    </TableCell>
                    <TableCell>{r.prix?.toLocaleString()}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImmeubleTable;
