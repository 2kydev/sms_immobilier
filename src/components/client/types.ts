
export interface Client {
  id: string;
  civilite: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  type: 'acheteur' | 'vendeur' | 'locataire' | 'prospect';
  budget_min?: number;
  budget_max?: number;
  type_bien?: string;
  quartiers?: string[];
  preferred_city?: string;
  dernier_contact: string;
  notes: string;
}

export const TYPES_BIEN = [
  'appartement',
  'maison',
  'studio',
  'terrain',
  'local',
  'villa',
  'duplex',
  'loft'
];
