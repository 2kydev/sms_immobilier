
export interface Transaction {
  id: string;
  client_id: string | null;
  property_id: string | null;
  valeur: number;
  etape: string; // Changed from union type to string to match database
  agent: string;
  date_creation: string;
  derniere_activite: string;
  notes: string | null;
  probabilite: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export interface Property {
  id: string;
  titre: string;
  prix: number;
  adresse: string;
  city: string;
  quartier: string;
}

export const etapes = [
  { key: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-800' },
  { key: 'visite', label: 'Visite programmée', color: 'bg-blue-100 text-blue-800' },
  { key: 'offre', label: 'Offre', color: 'bg-purple-100 text-purple-800' },
  { key: 'negociation', label: 'Négociation', color: 'bg-orange-100 text-orange-800' },
  { key: 'compromis', label: 'Compromis', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'finalise', label: 'Vente finalisée', color: 'bg-green-100 text-green-800' }
];
