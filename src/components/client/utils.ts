
export const getTypeColor = (type: string) => {
  switch (type) {
    case 'acheteur': return 'bg-green-100 text-green-800';
    case 'vendeur': return 'bg-blue-100 text-blue-800';
    case 'locataire': return 'bg-purple-100 text-purple-800';
    case 'prospect': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const filterClients = (clients: any[], searchTerm: string, filterType: string) => {
  return clients.filter(client => {
    const matchesSearch = `${client.prenom} ${client.nom} ${client.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'tous' || client.type === filterType;
    return matchesSearch && matchesType;
  });
};
