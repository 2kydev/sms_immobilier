
export interface Transaction {
  id: number;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  propriete: string;
  valeur: number;
  etape: 'prospect' | 'visite' | 'offre' | 'negociation' | 'compromis' | 'finalise';
  agent: string;
  dateCreation: string;
  derniereActivite: string;
  notes: string;
  probabilite: number;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

export interface Property {
  id: string;
  titre: string;
  prix: number;
  adresse: string;
}

export const etapes = [
  { key: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-800' },
  { key: 'visite', label: 'Visite programmée', color: 'bg-blue-100 text-blue-800' },
  { key: 'offre', label: 'Offre', color: 'bg-purple-100 text-purple-800' },
  { key: 'negociation', label: 'Négociation', color: 'bg-orange-100 text-orange-800' },
  { key: 'compromis', label: 'Compromis', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'finalise', label: 'Vente finalisée', color: 'bg-green-100 text-green-800' }
];
