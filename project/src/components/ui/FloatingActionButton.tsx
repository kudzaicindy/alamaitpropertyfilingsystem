import React, { useState } from 'react';
import { Plus, Home, Car, Shield } from 'lucide-react';

interface FloatingActionButtonProps {
  activeTab: 'properties' | 'insurance';
  onAddProperty?: () => void;
  onAddInsurance?: (type: 'property' | 'vehicle' | 'asset') => void;
}

export function FloatingActionButton({ activeTab, onAddProperty, onAddInsurance }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (activeTab === 'properties' && onAddProperty) {
      onAddProperty();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {activeTab === 'insurance' && isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2">
          <button
            onClick={() => {
              onAddInsurance?.('property');
              setIsOpen(false);
            }}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Add Property Insurance"
          >
            <Home className="h-6 w-6" />
          </button>
          <button
            onClick={() => {
              onAddInsurance?.('vehicle');
              setIsOpen(false);
            }}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Add Vehicle Insurance"
          >
            <Car className="h-6 w-6" />
          </button>
          <button
            onClick={() => {
              onAddInsurance?.('asset');
              setIsOpen(false);
            }}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Add Asset Insurance"
          >
            <Shield className="h-6 w-6" />
          </button>
        </div>
      )}
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title={activeTab === 'properties' ? 'Add Property' : 'Add Insurance'}
      >
        <Plus className="h-8 w-8" />
      </button>
    </div>
  );
} 