import React from 'react';
import { Property } from '../../types/property';
import { PropertyCard } from './PropertyCard';

type PropertyListProps = {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
};

export function PropertyList({ properties, onSelectProperty }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No properties found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <PropertyCard 
          key={property.id}
          property={property}
          onSelect={onSelectProperty}
        />
      ))}
    </div>
  );
}