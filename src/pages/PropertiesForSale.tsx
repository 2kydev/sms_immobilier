import React, { useEffect, useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import SalePropertiesKPIs from '@/components/SalePropertiesKPIs';
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
interface Property {
  id: string;
  type: string;
  prix: number;
  transaction_type: 'vente' | 'location';
  statut: string;
}

const PropertiesForSale = () => {
  const [selectedType, setSelectedType] = useState<"terrain" | "maison" | "entrepot" | "immeuble">("terrain");
  const [showForm, setShowForm] = useState(false); // terrain
  const [showMaisonForm, setShowMaisonForm] = useState(false);
  const [showEntrepotForm, setShowEntrepotForm] = useState(false);
  const [showImmeubleForm, setShowImmeubleForm] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties data for price KPIs
  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, type, prix, transaction_type, statut')
        .eq('transaction_type', 'vente')
        .neq('statut', 'archivé');
      
      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = (data || []).map(item => ({
        ...item,
        transaction_type: item.transaction_type as 'vente' | 'location'
      }));
      
      setProperties(transformedData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics for sale properties by type
  const calculateSaleMetrics = () => {
    const saleProps = properties.filter(p => p.statut !== 'archivé');
    
    const valueByType = {
      terrain: saleProps.filter(p => p.type === 'terrain').reduce((sum, p) => sum + p.prix, 0),
      maison: saleProps.filter(p => p.type === 'maison').reduce((sum, p) => sum + p.prix, 0),
      entrepot: saleProps.filter(p => p.type === 'entrepot').reduce((sum, p) => sum + p.prix, 0),
      immeuble: saleProps.filter(p => p.type === 'immeuble').reduce((sum, p) => sum + p.prix, 0),
      autres: saleProps.filter(p => !['terrain', 'maison', 'entrepot', 'immeuble'].includes(p.type)).reduce((sum, p) => sum + p.prix, 0)
    };

    const countByType = {
      terrain: saleProps.filter(p => p.type === 'terrain').length,
      maison: saleProps.filter(p => p.type === 'maison').length,
      entrepot: saleProps.filter(p => p.type === 'entrepot').length,
      immeuble: saleProps.filter(p => p.type === 'immeuble').length,
      autres: saleProps.filter(p => !['terrain', 'maison', 'entrepot', 'immeuble'].includes(p.type)).length
    };

    return { valueByType, countByType };
  };
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

    // Fetch properties data
    fetchProperties();
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

  const saleMetrics = calculateSaleMetrics();
  return <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-primary">{headerTitle}</h1>
        <div className="flex items-center gap-3">
          <ToggleGroup
            type="single"
            value={selectedType}
            onValueChange={(v) => v && setSelectedType(v as any)}
            variant="segmented"
            size="sm"
            aria-label="Filtrer par type de bien"
          >
            <ToggleGroupItem value="terrain">Terrain</ToggleGroupItem>
            <ToggleGroupItem value="maison">Maison</ToggleGroupItem>
            <ToggleGroupItem value="entrepot">Entrepôt</ToggleGroupItem>
            <ToggleGroupItem value="immeuble">Immeuble</ToggleGroupItem>
          </ToggleGroup>
          {selectedType === "maison" && !showMaisonForm}
          {selectedType === "entrepot" && !showEntrepotForm}
          {selectedType === "immeuble" && !showImmeubleForm}
          <span className="sr-only">Contrôles d’actions disponibles dans chaque tableau</span>
        </div>
      </header>

      {/* KPIs Biens à Vendre par Type */}
      {!loading && (
        <SalePropertiesKPIs 
          valueByType={saleMetrics.valueByType}
          countByType={saleMetrics.countByType}
        />
      )}

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