import React from 'react';
import { Building, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Property } from '../../types/property';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type PropertyCardProps = {
  property: Property;
  onSelect: (property: Property) => void;
};

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPropertyTypeColor = (type: string) => {
    const typeColors = {
      House: 'primary',
      Land: 'success',
      Flat: 'secondary',
      Cottage: 'warning',
      Cluster: 'danger'
    } as Record<string, any>;
    
    return typeColors[type] || 'default';
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:translate-y-[-4px]">
      <CardContent className="flex-grow p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
          <Badge variant={getPropertyTypeColor(property.propertyType)}>
            {property.propertyType}
          </Badge>
        </div>
        
        <div className="space-y-3 text-sm mb-4">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
            <span className="text-gray-600 line-clamp-2">{property.address}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600">Purchased: {property.purchaseDate}</span>
          </div>
          
          <div className="flex items-center">
            <Building className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600">Owned by: {property.ownedEntity}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Purchase:</span>
            <span className="font-medium">{formatCurrency(property.purchasePrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Current Value:</span>
            <span className="font-medium text-green-600">{formatCurrency(property.estimatedCurrentValue)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 bg-gray-50">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onSelect(property)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}