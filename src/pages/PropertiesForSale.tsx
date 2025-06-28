
import React, { useState } from 'react';
import PropertyFormSimple from '@/components/property/PropertyFormSimple';
import PropertyListView from '@/components/property/PropertyListView';

const PropertiesForSale = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAddProperty = () => {
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
  };

  if (showForm) {
    return <PropertyFormSimple onBack={handleBackToList} />;
  }

  return <PropertyListView onAddProperty={handleAddProperty} />;
};

export default PropertiesForSale;
