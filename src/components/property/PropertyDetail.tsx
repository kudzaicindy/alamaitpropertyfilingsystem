import React from 'react';
import { X, Edit, MapPin, Calendar, Building, DollarSign, TrendingUp } from 'lucide-react';
import { Property } from '../../types/property';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PropertyDocuments } from './PropertyDocuments';

type PropertyDetailProps = {
  property: Property;
  onClose: () => void;
  onEdit: (property: Property) => void;
};

export function PropertyDetail({ property, onClose, onEdit }: PropertyDetailProps) {
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

  const roi = property.totalPurchaseAmount > 0 
    ? ((property.estimatedCurrentValue - property.totalPurchaseAmount) / property.totalPurchaseAmount * 100).toFixed(1) 
    : 0;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">{property.name}</h2>
            <Badge variant={getPropertyTypeColor(property.propertyType)} className="ml-3">
              {property.propertyType}
            </Badge>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start mb-3">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <span className="text-gray-800">{property.address}</span>
            </div>
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-800">Purchased: {property.purchaseDate}</span>
            </div>
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-800">Owned by: {property.ownedEntity}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Financial Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="font-medium">{formatCurrency(property.purchasePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Fees:</span>
                  <span className="font-medium">{formatCurrency(property.purchaseFees)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600 font-medium">Total Purchase:</span>
                  <span className="font-semibold">{formatCurrency(property.totalPurchaseAmount)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(property.estimatedCurrentValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className="font-medium">{roi}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Planned Use:</span>
                  <span className="font-medium">{property.usageAfterInvestment}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-sm font-medium text-blue-700">Investment Opportunity</h3>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Required Investment:</span>
              <span className="font-medium text-blue-800">
                {formatCurrency(property.investmentRequired)}
              </span>
            </div>
            {property.potentialIncome > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-blue-800">Potential Income:</span>
                <span className="font-medium text-blue-800">
                  {formatCurrency(property.potentialIncome)}/month
                </span>
              </div>
            )}
          </div>

          <PropertyDocuments 
            documents={property.documents || []}
            onAddDocument={() => {}}
            onViewDocument={(doc) => console.log('View document:', doc)}
          />
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-3"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onEdit(property)}
            icon={<Edit className="h-4 w-4" />}
          >
            Edit Property
          </Button>
        </div>
      </div>
    </div>
  );
}