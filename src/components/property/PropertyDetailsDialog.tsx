import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import PropertyImageGallery from "@/components/PropertyImageGallery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, Loader2, CheckCircle } from "lucide-react";

interface PropertyDetailsDialogProps {
  propertyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updated: any) => void;
}

const PropertyDetailsDialog: React.FC<PropertyDetailsDialogProps> = ({ propertyId, open, onOpenChange, onUpdated }) => {
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !propertyId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();
        if (error) throw error;
        setProperty(data);
      } catch (err) {
        console.error(err);
        toast({ title: "Erreur", description: "Impossible de charger le bien", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [open, propertyId, toast]);

  const images: string[] = useMemo(() => property?.images || [], [property]);

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    try {
      const payload = {
        titre: property.titre,
        prix: property.prix,
        surface: property.surface,
        city: property.city,
        quartier: property.quartier,
        description: property.description,
        updated_at: new Date().toISOString(),
      } as any;
      const { error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", property.id);
      if (error) throw error;
      toast({ title: "Enregistré", description: "Le bien a été mis à jour." });
      setEditing(false);
      onUpdated?.(payload);
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "La mise à jour a échoué", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSold = async () => {
    if (!property) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({ statut: "vendu", updated_at: new Date().toISOString() })
        .eq("id", property.id);
      if (error) throw error;
      toast({ title: "Marqué comme vendu", description: "Le statut a été mis à jour." });
      setProperty({ ...property, statut: "vendu" });
      onUpdated?.({ statut: "vendu" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "Impossible de marquer comme vendu", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {property?.titre || "Détails du bien"}
            {property?.statut && (
              <Badge variant={property.statut === "vendu" ? "success" : "secondary"}>
                {property.statut === "vendu" ? "Vendu" : property.statut}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Fiche détaillée du bien avec informations et médias.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <PropertyImageGallery images={images} propertyTitle={property?.titre || "Bien"} />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <div className="text-sm text-foreground/90">{property?.type}</div>
                  </div>
                  <div>
                    <Label>Transaction</Label>
                    <div className="text-sm text-foreground/90">{property?.transaction_type}</div>
                  </div>
                  <div>
                    <Label>Surface (m²)</Label>
                    {editing ? (
                      <Input
                        value={property?.surface ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, surface: Number(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.surface?.toLocaleString?.() || "—"}</div>
                    )}
                  </div>
                  <div>
                    <Label>Prix (FCFA)</Label>
                    {editing ? (
                      <Input
                        value={property?.prix ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, prix: Number(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.prix?.toLocaleString?.() || "—"}</div>
                    )}
                  </div>
                  <div>
                    <Label>Ville</Label>
                    {editing ? (
                      <Input
                        value={property?.city ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, city: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.city}</div>
                    )}
                  </div>
                  <div>
                    <Label>Quartier</Label>
                    {editing ? (
                      <Input
                        value={property?.quartier ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, quartier: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.quartier}</div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  {editing ? (
                    <Input
                      value={property?.adresse ?? ""}
                      onChange={(e) => setProperty((p: any) => ({ ...p, adresse: e.target.value }))}
                    />
                  ) : (
                    <div className="text-sm text-foreground/90">{property?.adresse}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  {editing ? (
                    <Input
                      value={property?.description ?? ""}
                      onChange={(e) => setProperty((p: any) => ({ ...p, description: e.target.value }))}
                    />
                  ) : (
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {property?.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Agent</Label>
                <div className="text-sm text-foreground/90">{property?.agent}</div>
              </div>
              <div>
                <Label>Créé le</Label>
                <div className="text-sm text-foreground/90">{property?.created_at ? new Date(property.created_at).toLocaleString() : "—"}</div>
              </div>
              <div>
                <Label>Dernière mise à jour</Label>
                <div className="text-sm text-foreground/90">{property?.updated_at ? new Date(property.updated_at).toLocaleString() : "—"}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {property?.extrait_topographique && (
                  <a href={property.extrait_topographique} target="_blank" rel="noreferrer" className="underline">
                    Voir l’extrait topographique
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!editing ? (
                  <Button variant="secondary" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" /> Modifier
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Enregistrer
                  </Button>
                )}
                <Button variant="outline" onClick={handleMarkSold} disabled={saving || property?.statut === "vendu"}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Marquer comme vendu
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;
