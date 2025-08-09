import React, { useEffect, useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PropertyListView from "@/components/property/PropertyListView";
import TerrainTable from "@/components/property/terrain/TerrainTable";
import TerrainForm from "@/components/property/terrain/TerrainForm";
import MaisonForm from "@/components/property/house/MaisonForm";
import MaisonTable from "@/components/property/house/MaisonTable";
import EntrepotForm from "@/components/property/entrepot/EntrepotForm";
import EntrepotTable from "@/components/property/entrepot/EntrepotTable";
import ImmeubleForm from "@/components/property/immeuble/ImmeubleForm";
import ImmeubleTable from "@/components/property/immeuble/ImmeubleTable";
const PropertiesForSale = () => {
  const [selectedType, setSelectedType] = useState<"terrain" | "maison" | "entrepot" | "immeuble">("terrain");
  const [showForm, setShowForm] = useState(false); // terrain
  const [showMaisonForm, setShowMaisonForm] = useState(false);
  const [showEntrepotForm, setShowEntrepotForm] = useState(false);
  const [showImmeubleForm, setShowImmeubleForm] = useState(false);
  useEffect(() => {
    // Basic SEO for this page
    document.title = "Biens à vendre | Gestion des propriétés";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Page des biens à vendre: filtres par type (Terrain, Maison, Entrepôt, Immeuble), tableau récapitulatif et création de nouveaux terrains.");
    } else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Page des biens à vendre: filtres par type (Terrain, Maison, Entrepôt, Immeuble), tableau récapitulatif et création de nouveaux terrains.";
      document.head.appendChild(m);
    }
  }, []);
  const headerTitle = useMemo(() => {
    switch (selectedType) {
      case "terrain":
        return "Biens à vendre – Terrains";
      case "maison":
        return "Biens à vendre – Maisons";
      case "entrepot":
        return "Biens à vendre – Entrepôts";
      case "immeuble":
        return "Biens à vendre – Immeubles";
      default:
        return "Biens à vendre";
    }
  }, [selectedType]);
  return <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-primary">{headerTitle}</h1>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={selectedType} onValueChange={v => v && setSelectedType(v as any)}>
            <ToggleGroupItem value="terrain">Terrain</ToggleGroupItem>
            <ToggleGroupItem value="maison">Maison</ToggleGroupItem>
            <ToggleGroupItem value="entrepot">Entrepôt</ToggleGroupItem>
            <ToggleGroupItem value="immeuble">Immeuble</ToggleGroupItem>
          </ToggleGroup>
          {selectedType === "maison" && !showMaisonForm}
          {selectedType === "entrepot" && !showEntrepotForm}
          {selectedType === "immeuble" && !showImmeubleForm}
        </div>
      </header>

      <main>
        {selectedType === "terrain" ? showForm ? <TerrainForm onBack={() => setShowForm(false)} /> : <TerrainTable onCreate={() => setShowForm(true)} /> : selectedType === "maison" ? showMaisonForm ? <MaisonForm onBack={() => setShowMaisonForm(false)} /> : <MaisonTable onCreate={() => setShowMaisonForm(true)} /> : selectedType === "entrepot" ? showEntrepotForm ? <EntrepotForm onBack={() => setShowEntrepotForm(false)} /> : <EntrepotTable onCreate={() => setShowEntrepotForm(true)} /> : selectedType === "immeuble" ? showImmeubleForm ? <ImmeubleForm onBack={() => setShowImmeubleForm(false)} /> : <ImmeubleTable onCreate={() => setShowImmeubleForm(true)} /> : <Card>
            <CardHeader>
              <CardTitle>Vue générale</CardTitle>
              <CardDescription>
                Liste et actions générales pour le type sélectionné. La vue détaillée terrain est disponible via les boutons ci-dessus.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyListView onAddProperty={() => setShowForm(true)} />
            </CardContent>
          </Card>}
      </main>
    </div>;
};
export default PropertiesForSale;