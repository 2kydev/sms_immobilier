
export interface Transaction {
  id: string;
  client_id: string | null;
  property_id: string | null;
  valeur: number;
  etape: string; // Keep as string for database compatibility
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

export interface Profile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string; // Keep as string for database compatibility
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

export const etapes = [
  { key: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-800' },
  { key: 'visite', label: 'Visite programmée', color: 'bg-blue-100 text-blue-800' },
  { key: 'offre', label: 'Offre', color: 'bg-purple-100 text-purple-800' },
  { key: 'negociation', label: 'Négociation', color: 'bg-orange-100 text-orange-800' },
  { key: 'compromis', label: 'Compromis', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'finalise', label: 'Vente finalisée', color: 'bg-green-100 text-green-800' }
];

export const roles = [
  { key: 'admin', label: 'Administrateur', description: 'Accès complet au système' },
  { key: 'directeur', label: 'Directeur', description: 'Accès au tableau de bord et rapports' },
  { key: 'agent', label: 'Agent', description: 'Gestion des visites et propriétés' },
  { key: 'commercial', label: 'Commercial', description: 'Gestion des clients et prospects' }
];

// Types d'union pour les valeurs valides (used for form validation)
export type EtapeType = 'prospect' | 'visite' | 'offre' | 'negociation' | 'compromis' | 'finalise';
export type RoleType = 'admin' | 'directeur' | 'agent' | 'commercial';

// Type guards for validation
export const isValidEtape = (etape: string): etape is EtapeType => {
  return etapes.some(e => e.key === etape);
};

export const isValidRole = (role: string): role is RoleType => {
  return roles.some(r => r.key === role);
};
