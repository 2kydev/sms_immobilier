
import React, { useState } from 'react';
import PropertyForm from '@/components/property/PropertyForm';
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
    return <PropertyForm onBack={handleBackToList} />;
  }

  return <PropertyListView onAddProperty={handleAddProperty} />;
};

export default PropertiesForSale;
