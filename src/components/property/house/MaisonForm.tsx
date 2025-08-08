import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import FileUpload from "@/components/FileUpload";

interface MaisonFormProps {
  onBack: () => void;
}

type Agent = { id: string; nom: string };

type CommissionType = "percentage" | "fixed";

type MaisonType = "individuelle" | "jumelee" | "villa" | "duplexe" | "triplexe" | "autre";

type StatutJuridique =
  | "titre_foncier"
  | "adu"
  | "acd"
  | "attestation_villageoise"
  | "autre";

const MaisonForm: React.FC<MaisonFormProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Informations générales
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [surfaceHabitable, setSurfaceHabitable] = useState<string>("");
  const [surfaceTerrain, setSurfaceTerrain] = useState<string>("");
  const [pieces, setPieces] = useState<string>("");
  const [chambres, setChambres] = useState<string>("");
  const [sallesDeBain, setSallesDeBain] = useState<string>("");
  const [garage, setGarage] = useState<boolean>(false);
  const [jardin, setJardin] = useState<boolean>(false);
  const [piscine, setPiscine] = useState<boolean>(false);
  const [adresse, setAdresse] = useState("");
  const [city, setCity] = useState("");
  const [quartier, setQuartier] = useState("");
  const [refCadastrale, setRefCadastrale] = useState("");
  const [statutJuridique, setStatutJuridique] = useState<StatutJuridique | "">("");
  const [typeMaison, setTypeMaison] = useState<MaisonType | "">("");

  // 2️⃣ Documents et médias
  const [planUrls, setPlanUrls] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [legalDocs, setLegalDocs] = useState<string[]>([]);
  const [legalDocTitles, setLegalDocTitles] = useState<string[]>([]);

  // 3️⃣ Informations financières
  const [prix, setPrix] = useState<string>("");
  const [modesPaiement, setModesPaiement] = useState<string[]>([]);
  const [taxesFrais, setTaxesFrais] = useState("");
  const [commissionType, setCommissionType] = useState<CommissionType>("percentage");
  const [commissionValue, setCommissionValue] = useState<string>("");

  // 4️⃣ Vendeur
  const [vendeurNom, setVendeurNom] = useState("");
  const [vendeurTelephone, setVendeurTelephone] = useState("");
  const [vendeurEmail, setVendeurEmail] = useState("");
  const [vendeurStatut, setVendeurStatut] = useState("");
  const [pieceIdentiteUrls, setPieceIdentiteUrls] = useState<string[]>([]);

  // 5️⃣ Annonce
  const [annonceRef, setAnnonceRef] = useState("");
  const [dateMiseEnVente, setDateMiseEnVente] = useState<Date | undefined>();
  const [disponibiliteVisite, setDisponibiliteVisite] = useState("");

  // Agent requis par la table properties
  const [agent, setAgent] = useState("");

  // Charger les agents actifs
  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, nom, statut")
        .eq("statut", "actif")
        .order("nom", { ascending: true });
      if (!error) setAgents((data || []).map((a: any) => ({ id: a.id, nom: a.nom })));
    };
    fetchAgents();
  }, []);

  // Sync des titres de documents avec la longueur
  useEffect(() => {
    setLegalDocTitles((prev) => {
      const next = [...prev];
      if (legalDocs.length > prev.length) {
        return next.concat(new Array(legalDocs.length - prev.length).fill(""));
      }
      return next.slice(0, legalDocs.length);
    });
  }, [legalDocs.length]);

  const surfaceHabitableM2 = useMemo(() => parseFloat(surfaceHabitable || "0") || 0, [surfaceHabitable]);
  const surfaceTerrainM2 = useMemo(() => parseFloat(surfaceTerrain || "0") || 0, [surfaceTerrain]);

  const toggleMode = (mode: string) => {
    setModesPaiement((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // validations
      if (!titre.trim()) throw new Error("Le titre de l’annonce est obligatoire");
      if (!surfaceHabitableM2 || surfaceHabitableM2 <= 0) throw new Error("La superficie habitable est obligatoire");
      if (!surfaceTerrainM2 || surfaceTerrainM2 <= 0) throw new Error("La superficie du terrain est obligatoire");
      if (!pieces || parseInt(pieces) < 0) throw new Error("Le nombre de pièces est obligatoire");
      if (!chambres || parseInt(chambres) < 0) throw new Error("Le nombre de chambres est obligatoire");
      if (!city.trim() || !quartier.trim()) throw new Error("La ville et le quartier sont obligatoires");
      if (!statutJuridique) throw new Error("Le statut juridique est obligatoire");
      if (!typeMaison) throw new Error("Le type de maison est obligatoire");
      if (!photos.length) throw new Error("Ajoutez au moins une photo (max 10)");
      if (!prix || parseFloat(prix) <= 0) throw new Error("Le prix est obligatoire");
      if (!vendeurNom.trim() || !vendeurTelephone.trim() || !vendeurEmail.trim()) throw new Error("Les coordonnées du vendeur sont obligatoires");
      if (!dateMiseEnVente) throw new Error("La date de mise en vente est obligatoire");
      if (!agent) throw new Error("L'agent responsable est obligatoire");

      const acd = statutJuridique === "acd";
      const adu = statutJuridique === "adu";

      const autres = {
        reference_cadastrale: refCadastrale || null,
        statut_juridique: statutJuridique,
        type_maison: typeMaison,
        superficie_terrain: surfaceTerrainM2,
        chambres: parseInt(chambres || "0"),
        garage: !!garage,
        legal_documents: legalDocs.map((url, i) => ({ title: legalDocTitles[i] || "Document", url })),
        mode_paiement: modesPaiement,
        taxes_frais: taxesFrais || null,
        commission: commissionValue ? { type: commissionType, value: parseFloat(commissionValue) } : null,
        vendeur: {
          nom: vendeurNom,
          telephone: vendeurTelephone,
          email: vendeurEmail,
          statut: vendeurStatut || null,
          piece_identite_url: pieceIdentiteUrls[0] || null,
        },
        annonce: {
          reference: annonceRef || null,
          date_mise_en_vente: dateMiseEnVente?.toISOString() || null,
          disponibilite_visite: disponibiliteVisite || null,
        },
      };

      const { error: insertError } = await supabase
        .from("properties")
        .insert([
          {
            titre: titre.trim(),
            description: description.trim(),
            type: "maison",
            transaction_type: "vente",
            prix: parseInt(prix),
            surface: surfaceHabitableM2,
            pieces: parseInt(pieces || "0"),
            nombre_salles_eau: sallesDeBain ? parseInt(sallesDeBain) : null,
            jardin,
            piscine,
            cuisine_independante: false,
            acd,
            adu,
            nom_proprietaire: vendeurNom,
            contacts_proprietaire: `${vendeurTelephone} | ${vendeurEmail}`,
            autres_details: JSON.stringify(autres),
            adresse: adresse.trim(),
            quartier: quartier.trim(),
            city: city.trim(),
            images: photos,
            extrait_topographique: planUrls[0] || null,
            agent,
            statut: "disponible",
          },
        ]);

      if (insertError) throw insertError;

      toast({ title: "Succès", description: "Maison enregistrée avec succès" });
      onBack();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erreur", description: err?.message || "Enregistrement impossible", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button variant="outline" type="button" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Button>

      {/* 1️⃣ Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Renseignez les détails principaux de la maison</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Titre de l’annonce *</Label>
            <Input value={titre} onChange={(e) => setTitre(e.target.value)} required />
          </div>

          <div className="md:col-span-2">
            <Label>Description détaillée</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <Label>Superficie habitable (m²) *</Label>
            <Input type="number" step="0.01" min="0" value={surfaceHabitable} onChange={(e) => setSurfaceHabitable(e.target.value)} required />
          </div>

          <div>
            <Label>Superficie du terrain (m²) *</Label>
            <Input type="number" step="0.01" min="0" value={surfaceTerrain} onChange={(e) => setSurfaceTerrain(e.target.value)} required />
          </div>

          <div>
            <Label>Nombre de pièces *</Label>
            <Input type="number" min="0" value={pieces} onChange={(e) => setPieces(e.target.value)} required />
          </div>

          <div>
            <Label>Nombre de chambres *</Label>
            <Input type="number" min="0" value={chambres} onChange={(e) => setChambres(e.target.value)} required />
          </div>

          <div>
            <Label>Nombre de salles de bain</Label>
            <Input type="number" min="0" value={sallesDeBain} onChange={(e) => setSallesDeBain(e.target.value)} />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2">
              <Checkbox checked={garage} onCheckedChange={() => setGarage((v) => !v)} />
              <span>Garage</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={jardin} onCheckedChange={() => setJardin((v) => !v)} />
              <span>Jardin</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={piscine} onCheckedChange={() => setPiscine((v) => !v)} />
              <span>Piscine</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <Label>Adresse complète</Label>
            <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          </div>

          <div>
            <Label>Ville *</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div>
            <Label>Quartier *</Label>
            <Input value={quartier} onChange={(e) => setQuartier(e.target.value)} required />
          </div>

          <div>
            <Label>Référence cadastrale</Label>
            <Input value={refCadastrale} onChange={(e) => setRefCadastrale(e.target.value)} />
          </div>

          <div>
            <Label>Statut juridique *</Label>
            <Select value={statutJuridique} onValueChange={(v: any) => setStatutJuridique(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="titre_foncier">Titre foncier</SelectItem>
                <SelectItem value="adu">ADU</SelectItem>
                <SelectItem value="acd">ACD</SelectItem>
                <SelectItem value="attestation_villageoise">Attestation villageoise</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Type de maison *</Label>
            <Select value={typeMaison} onValueChange={(v: any) => setTypeMaison(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individuelle">Individuelle</SelectItem>
                <SelectItem value="jumelee">Jumelée</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="duplexe">Duplexe</SelectItem>
                <SelectItem value="triplexe">Triplexe</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Agent responsable *</Label>
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.nom}>{a.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2️⃣ Documents et médias */}
      <Card>
        <CardHeader>
          <CardTitle>Documents et médias</CardTitle>
          <CardDescription>Ajoutez le plan, les photos et documents légaux</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6">
          <div>
            <FileUpload
              files={planUrls}
              onFilesChange={setPlanUrls}
              maxFiles={1}
              acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png"]}
              label="Plan / croquis de la maison"
              description="PDF ou image. 1 fichier maximum"
            />
          </div>
          <div>
            <ImageUpload images={photos} onImagesChange={setPhotos} maxImages={10} />
          </div>
          <div className="space-y-3">
            <FileUpload
              files={legalDocs}
              onFilesChange={setLegalDocs}
              maxFiles={10}
              acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]}
              label="Documents légaux"
              description="Ajoutez vos documents légaux (PDF, images, DOC)"
            />
            {legalDocs.length > 0 && (
              <div className="space-y-2">
                <Label>Titres des documents</Label>
                <div className="space-y-2">
                  {legalDocs.map((url, idx) => (
                    <div key={url} className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <Input
                        placeholder={`Titre pour le document ${idx + 1}`}
                        value={legalDocTitles[idx] || ""}
                        onChange={(e) => {
                          const next = [...legalDocTitles];
                          next[idx] = e.target.value;
                          setLegalDocTitles(next);
                        }}
                      />
                      <Input value={url} readOnly className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3️⃣ Informations financières */}
      <Card>
        <CardHeader>
          <CardTitle>Informations financières</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Prix de vente (FCFA) *</Label>
            <Input type="number" min="0" value={prix} onChange={(e) => setPrix(e.target.value)} required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Mode de paiement accepté</Label>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "cash", label: "Cash" },
                { key: "echelonne", label: "Échelonné" },
                { key: "banque", label: "Financement bancaire" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-2">
                  <Checkbox checked={modesPaiement.includes(opt.key)} onCheckedChange={() => toggleMode(opt.key)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Taxes et frais</Label>
            <Textarea rows={3} value={taxesFrais} onChange={(e) => setTaxesFrais(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Commission</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                placeholder="Valeur"
              />
            </div>
            <div className="self-end">
              <Select value={commissionType} onValueChange={(v: any) => setCommissionType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                  <SelectItem value="fixed">Montant fixe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4️⃣ Vendeur */}
      <Card>
        <CardHeader>
          <CardTitle>Informations sur le vendeur</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Nom et prénom ou raison sociale *</Label>
            <Input value={vendeurNom} onChange={(e) => setVendeurNom(e.target.value)} required />
          </div>
          <div>
            <Label>Téléphone *</Label>
            <Input value={vendeurTelephone} onChange={(e) => setVendeurTelephone(e.target.value)} required />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input type="email" value={vendeurEmail} onChange={(e) => setVendeurEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Statut du vendeur</Label>
            <Select value={vendeurStatut} onValueChange={setVendeurStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="particulier">Particulier</SelectItem>
                <SelectItem value="entreprise">Entreprise</SelectItem>
                <SelectItem value="promoteur">Promoteur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <FileUpload
              files={pieceIdentiteUrls}
              onFilesChange={setPieceIdentiteUrls}
              maxFiles={1}
              acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png"]}
              label="Pièce d’identité / document de société"
              description="PDF ou image. 1 fichier maximum"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5️⃣ Annonce */}
      <Card>
        <CardHeader>
          <CardTitle>Informations sur l’annonce</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Référence de l’annonce</Label>
            <Input value={annonceRef} onChange={(e) => setAnnonceRef(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <Label>Date de mise en vente *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("justify-start text-left font-normal", !dateMiseEnVente && "text-muted-foreground")}
                  type="button"
                >
                  {dateMiseEnVente ? (
                    dateMiseEnVente.toLocaleDateString()
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateMiseEnVente}
                  onSelect={setDateMiseEnVente}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="md:col-span-2">
            <Label>Disponibilité pour visite</Label>
            <Textarea rows={3} value={disponibiliteVisite} onChange={(e) => setDisponibiliteVisite(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer la maison"}
        </Button>
      </div>
    </form>
  );
};

export default MaisonForm;
