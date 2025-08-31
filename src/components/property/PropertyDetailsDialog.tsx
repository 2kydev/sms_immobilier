import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PropertyImageGallery from "@/components/PropertyImageGallery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, Loader2, CheckCircle, X } from "lucide-react";

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
        type: property.type,
        prix: property.prix,
        surface: property.surface,
        pieces: property.pieces,
        city: property.city,
        quartier: property.quartier,
        adresse: property.adresse,
        description: property.description,
        statut: property.statut,
        transaction_type: property.transaction_type,
        agent: property.agent,
        nom_proprietaire: property.nom_proprietaire,
        contacts_proprietaire: property.contacts_proprietaire,
        charges: property.charges,
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'disponible': return 'default';
      case 'sous-offre': return 'secondary';
      case 'vendu': return 'destructive';
      case 'loue': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'sous-offre': return 'Sous offre';
      case 'vendu': return 'Vendu';
      case 'loue': return 'Loué';
      default: return status;
    }
  };

  // Smart display function for surface with unit
  const formatSurface = (surface: number, autresDetails: string | null) => {
    if (!surface) return "—";
    try {
      const details = autresDetails ? JSON.parse(autresDetails) : {};
      const unit = details.surface_unit || "m2"; // Default to m2 for existing properties
      
      if (unit === "ha") {
        // Convert back to hectares for display
        const hectares = surface / 10000;
        return `${hectares.toLocaleString()} ha`;
      }
      return `${surface.toLocaleString()} m²`;
    } catch (error) {
      // Fallback if JSON parsing fails
      return `${surface.toLocaleString()} m²`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {editing ? (
              <Input
                value={property?.titre ?? ""}
                onChange={(e) => setProperty((p: any) => ({ ...p, titre: e.target.value }))}
                className="text-lg font-semibold flex-1"
              />
            ) : (
              <span className="flex-1">{property?.titre || "Détails du bien"}</span>
            )}
            {property?.statut && (
              <Badge variant={getStatusBadgeVariant(property.statut)}>
                {getStatusLabel(property.statut)}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="order-2 lg:order-1">
                <PropertyImageGallery images={images} propertyTitle={property?.titre || "Bien"} />
              </div>
              <div className="space-y-4 order-1 lg:order-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    {editing ? (
                      <Select value={property?.type ?? ""} onValueChange={(value) => setProperty((p: any) => ({ ...p, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appartement">Appartement</SelectItem>
                          <SelectItem value="maison">Maison</SelectItem>
                          <SelectItem value="terrain">Terrain</SelectItem>
                          <SelectItem value="immeuble">Immeuble</SelectItem>
                          <SelectItem value="entrepot">Entrepôt</SelectItem>
                          <SelectItem value="bureau">Bureau</SelectItem>
                          <SelectItem value="commerce">Commerce</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-foreground/90 capitalize">{property?.type}</div>
                    )}
                  </div>
                  <div>
                    <Label>Transaction</Label>
                    {editing ? (
                      <Select value={property?.transaction_type ?? ""} onValueChange={(value) => setProperty((p: any) => ({ ...p, transaction_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type de transaction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vente">Vente</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-foreground/90 capitalize">{property?.transaction_type}</div>
                    )}
                  </div>
                  <div>
                    <Label>Statut</Label>
                    {editing ? (
                      <Select value={property?.statut ?? ""} onValueChange={(value) => setProperty((p: any) => ({ ...p, statut: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="vendu">Vendu</SelectItem>
                          <SelectItem value="loue">Loué</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-foreground/90">{getStatusLabel(property?.statut)}</div>
                    )}
                  </div>
                  <div>
                    <Label>Pièces</Label>
                    {editing ? (
                      <Input
                        type="number"
                        value={property?.pieces ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, pieces: Number(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.pieces || "—"}</div>
                    )}
                  </div>
                  <div>
                    <Label>Superficie</Label>
                    {editing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={property?.surface ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, surface: Number(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{formatSurface(property?.surface, property?.autres_details)}</div>
                    )}
                  </div>
                  <div>
                    <Label>Prix (FCFA)</Label>
                    {editing ? (
                      <Input
                        type="number"
                        value={property?.prix ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, prix: Number(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.prix?.toLocaleString?.() || "—"}</div>
                    )}
                  </div>
                  <div>
                    <Label>Charges (FCFA)</Label>
                    {editing ? (
                      <Input
                        type="number"
                        value={property?.charges ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, charges: Number(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.charges?.toLocaleString?.() || "—"}</div>
                    )}
                  </div>
                  <div>
                    <Label>Agent</Label>
                    {editing ? (
                      <Input
                        value={property?.agent ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, agent: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.agent}</div>
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

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Nom du propriétaire</Label>
                    {editing ? (
                      <Input
                        value={property?.nom_proprietaire ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, nom_proprietaire: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.nom_proprietaire || "Non renseigné"}</div>
                    )}
                  </div>
                  <div>
                    <Label>Contacts du propriétaire</Label>
                    {editing ? (
                      <Input
                        value={property?.contacts_proprietaire ?? ""}
                        onChange={(e) => setProperty((p: any) => ({ ...p, contacts_proprietaire: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm text-foreground/90">{property?.contacts_proprietaire || "Non renseigné"}</div>
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
                    <Textarea
                      value={property?.description ?? ""}
                      onChange={(e) => setProperty((p: any) => ({ ...p, description: e.target.value }))}
                      rows={4}
                    />
                  ) : (
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {property?.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Créé le</Label>
                <div className="text-sm text-foreground/90">{property?.created_at ? new Date(property.created_at).toLocaleString() : "—"}</div>
              </div>
              <div>
                <Label>Dernière mise à jour</Label>
                <div className="text-sm text-foreground/90">{property?.updated_at ? new Date(property.updated_at).toLocaleString() : "—"}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {property?.extrait_topographique && (
                  <a href={property.extrait_topographique} target="_blank" rel="noreferrer" className="underline">
                    Voir l'extrait topographique
                  </a>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {!editing ? (
                  <Button variant="secondary" onClick={() => setEditing(true)} className="w-full sm:w-auto">
                    <Pencil className="h-4 w-4 mr-2" /> Modifier
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Enregistrer
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="w-full sm:w-auto">
                      <X className="h-4 w-4 mr-2" /> Annuler
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;