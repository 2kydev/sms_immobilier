
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface PropertyFormProps {
  onBack: () => void;
}

const PropertyFormSimple: React.FC<PropertyFormProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const { toast } = useToast();

  // État pour tous les champs du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    type: 'appartement',
    transaction_type: 'vente',
    prix: '',
    surface: '',
    pieces: '',
    nombre_salles_eau: '',
    jardin: false,
    piscine: false,
    cuisine_independante: false,
    acd: false,
    adu: false,
    nom_proprietaire: '',
    contacts_proprietaire: '',
    autres_details: '',
    adresse: '',
    quartier: '',
    city: '',
    description: '',
    agent: ''
  });

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, nom, statut')
        .eq('statut', 'actif')
        .order('nom', { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting form data:', formData);

      // Validation
      if (!formData.titre.trim()) {
        throw new Error('Le titre est obligatoire');
      }
      if (!formData.prix || parseFloat(formData.prix) <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }
      if (!formData.surface || parseFloat(formData.surface) <= 0) {
        throw new Error('La superficie doit être supérieure à 0');
      }
      if (!formData.city.trim()) {
        throw new Error('La ville est obligatoire');
      }
      if (!formData.agent.trim()) {
        throw new Error('L\'agent est obligatoire');
      }

      // Préparer les données pour l'insertion
      const propertyData = {
        titre: formData.titre.trim(),
        type: formData.type,
        transaction_type: formData.transaction_type,
        prix: parseInt(formData.prix),
        surface: parseFloat(formData.surface),
        pieces: parseInt(formData.pieces) || 0,
        nombre_salles_eau: formData.nombre_salles_eau ? parseInt(formData.nombre_salles_eau) : null,
        jardin: formData.jardin,
        piscine: formData.piscine,
        cuisine_independante: formData.cuisine_independante,
        acd: formData.acd,
        adu: formData.adu,
        nom_proprietaire: formData.nom_proprietaire.trim() || null,
        contacts_proprietaire: formData.contacts_proprietaire.trim() || null,
        autres_details: formData.autres_details.trim() || null,
        adresse: formData.adresse.trim(),
        quartier: formData.quartier.trim(),
        city: formData.city.trim(),
        description: formData.description.trim(),
        agent: formData.agent.trim(),
        statut: 'disponible'
      };

      console.log('Data to insert:', propertyData);

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Insert successful:', data);

      toast({
        title: "Succès",
        description: "Bien immobilier enregistré avec succès"
      });

      // Reset et retour
      setFormData({
        titre: '',
        type: 'appartement',
        transaction_type: 'vente',
        prix: '',
        surface: '',
        pieces: '',
        nombre_salles_eau: '',
        jardin: false,
        piscine: false,
        cuisine_independante: false,
        acd: false,
        adu: false,
        nom_proprietaire: '',
        contacts_proprietaire: '',
        autres_details: '',
        adresse: '',
        quartier: '',
        city: '',
        description: '',
        agent: ''
      });
      
      onBack();

    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'enregistrement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-primary">Nouveau bien immobilier</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Enregistrement d'un nouveau bien immobilier</CardTitle>
          <CardDescription>
            Renseignez les informations du bien immobilier à mettre en vente ou en location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <Label htmlFor="titre">Titre du bien *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
                placeholder="Ex: Bel appartement au centre-ville"
                required
              />
            </div>

            <div>
              <Label htmlFor="transaction_type">Type de transaction *</Label>
              <Select value={formData.transaction_type} onValueChange={(value) => handleInputChange('transaction_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vente">À vendre</SelectItem>
                  <SelectItem value="location">À louer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Type de propriété *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="local">Local commercial</SelectItem>
                  <SelectItem value="immeuble">Immeuble</SelectItem>
                  <SelectItem value="duplexe">Duplexe</SelectItem>
                  <SelectItem value="triplexe">Triplexe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prix">Prix (FCFA) *</Label>
              <Input
                id="prix"
                type="number"
                value={formData.prix}
                onChange={(e) => handleInputChange('prix', e.target.value)}
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="surface">Superficie (m² ou ha) *</Label>
              <Input
                id="surface"
                type="number"
                step="0.01"
                value={formData.surface}
                onChange={(e) => handleInputChange('surface', e.target.value)}
                min="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="pieces">Nombre de pièces</Label>
              <Input
                id="pieces"
                type="number"
                value={formData.pieces}
                onChange={(e) => handleInputChange('pieces', e.target.value)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="nombre_salles_eau">Nombre de salles d'eau</Label>
              <Input
                id="nombre_salles_eau"
                type="number"
                value={formData.nombre_salles_eau}
                onChange={(e) => handleInputChange('nombre_salles_eau', e.target.value)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Entrez la ville"
                required
              />
            </div>

            <div>
              <Label htmlFor="quartier">Quartier</Label>
              <Input
                id="quartier"
                value={formData.quartier}
                onChange={(e) => handleInputChange('quartier', e.target.value)}
                placeholder="Entrez le quartier"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="adresse">Adresse complète</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder="Adresse détaillée du bien"
              />
            </div>

            <div>
              <Label htmlFor="agent">Agent responsable *</Label>
              <Select value={formData.agent} onValueChange={(value) => handleInputChange('agent', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.nom}>
                      {agent.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-base font-medium">Détails additionnels</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="jardin"
                    checked={formData.jardin}
                    onCheckedChange={(checked) => handleInputChange('jardin', checked)}
                  />
                  <Label htmlFor="jardin">Jardin</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="piscine"
                    checked={formData.piscine}
                    onCheckedChange={(checked) => handleInputChange('piscine', checked)}
                  />
                  <Label htmlFor="piscine">Piscine</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cuisine_independante"
                    checked={formData.cuisine_independante}
                    onCheckedChange={(checked) => handleInputChange('cuisine_independante', checked)}
                  />
                  <Label htmlFor="cuisine_independante">Cuisine indépendante</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acd"
                    checked={formData.acd}
                    onCheckedChange={(checked) => handleInputChange('acd', checked)}
                  />
                  <Label htmlFor="acd">ACD</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adu"
                    checked={formData.adu}
                    onCheckedChange={(checked) => handleInputChange('adu', checked)}
                  />
                  <Label htmlFor="adu">ADU</Label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée du bien immobilier..."
                rows={4}
              />
            </div>

            <div className="md:col-span-2 flex gap-4 pt-6">
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer le bien'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormData({
                  titre: '',
                  type: 'appartement',
                  transaction_type: 'vente',
                  prix: '',
                  surface: '',
                  pieces: '',
                  nombre_salles_eau: '',
                  jardin: false,
                  piscine: false,
                  cuisine_independante: false,
                  acd: false,
                  adu: false,
                  nom_proprietaire: '',
                  contacts_proprietaire: '',
                  autres_details: '',
                  adresse: '',
                  quartier: '',
                  city: '',
                  description: '',
                  agent: ''
                })}
                disabled={loading}
              >
                Réinitialiser
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyFormSimple;
