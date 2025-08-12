import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, Pencil, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PropertyDetailsDialog from "@/components/property/PropertyDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TerrainTableProps {
  onCreate: () => void;
}

type TerrainRow = {
  id: string;
  titre: string;
  surface: number;
  city: string;
  quartier: string;
  prix: number;
  statut: string;
  created_at: string;
};

const TerrainTable: React.FC<TerrainTableProps> = ({ onCreate }) => {
  const [rows, setRows] = useState<TerrainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSoldId, setConfirmSoldId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerrains = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("id, titre, surface, city, quartier, prix, statut, created_at")
          .eq("type", "terrain")
          .eq("transaction_type", "vente")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRows((data as TerrainRow[]) || []);
      } catch (err) {
        console.error(err);
        toast({ title: "Erreur", description: "Impossible de charger les terrains", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchTerrains();
  }, [toast]);

  const recap = useMemo(() => {
    const disponibles = rows.filter((r) => r.statut !== "vendu");
    const total = disponibles.length;
    const totalValue = disponibles.reduce((acc, r) => acc + (r.prix || 0), 0);
    return { total, totalValue };
  }, [rows]);

  const markAsSold = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ statut: "vendu", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.map((row) => row.id === id ? { ...row, statut: "vendu" } : row));
      toast({ title: "Marqué comme vendu", description: "Le bien a été mis à jour." });
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "Impossible de marquer comme vendu", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Récapitulatif des terrains</h2>
          <p className="text-muted-foreground">Liste des terrains actuellement en vente</p>
        </div>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nouveau terrain
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total des terrains</CardTitle>
            <CardDescription>Nombre total de terrains en vente</CardDescription>
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
          <CardTitle>Terrains</CardTitle>
          <CardDescription>Tableau récapitulatif des terrains à vendre</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Aucun terrain trouvé</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Superficie (m²)</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Prix (FCFA)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.titre}</TableCell>
                    <TableCell>{r.surface?.toLocaleString()}</TableCell>
                    <TableCell>
                      {r.city}{r.quartier ? `, ${r.quartier}` : ""}
                    </TableCell>
                    <TableCell>{r.prix?.toLocaleString()}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={r.statut === "vendu" ? "success" : "secondary"}>
                        {r.statut === "vendu" ? "Vendu" : "Disponible"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedId(r.id); setDetailsOpen(true); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voir</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedId(r.id); setDetailsOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Modifier</TooltipContent>
                          </Tooltip>
                          {r.statut !== "vendu" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setConfirmSoldId(r.id); setConfirmOpen(true); }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Marquer comme vendu</TooltipContent>
                            </Tooltip>
                          )}

                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmez-vous que ce bien est vendu ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action mettra à jour le statut du bien en "Vendu".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmSoldId) {
                  await markAsSold(confirmSoldId);
                  setConfirmOpen(false);
                  setConfirmSoldId(null);
                }
              }}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PropertyDetailsDialog
        propertyId={selectedId}
        open={detailsOpen}
        onOpenChange={(o) => {
          setDetailsOpen(o);
          if (!o) setSelectedId(null);
        }}
        onUpdated={(upd) => {
          if (selectedId && upd?.statut === "vendu") {
            setRows((prev) => prev.map((row) => row.id === selectedId ? { ...row, statut: "vendu" } : row));
          } else if (selectedId && (upd?.titre || upd?.prix || upd?.surface || upd?.city || upd?.quartier)) {
            setRows((prev) => prev.map((row) => row.id === selectedId ? {
              ...row,
              titre: upd.titre ?? row.titre,
              prix: upd.prix ?? row.prix,
              surface: upd.surface ?? row.surface,
              city: upd.city ?? row.city,
              quartier: upd.quartier ?? row.quartier,
            } : row));
          }
        }}
      />
    </div>
  );
};

export default TerrainTable;
