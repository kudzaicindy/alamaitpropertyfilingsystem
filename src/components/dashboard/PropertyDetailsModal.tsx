import React, { useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Property } from '../../types/property';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSave?: (updatedProperty: Property) => void;
}

export function PropertyDetailsModal({ isOpen, onClose, property, onSave }: PropertyDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState(property);
  const { isPropertyManager } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!isOpen) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        const updatedProperty = {
          ...property,
          ...editedProperty,
          // Ensure numeric fields are properly formatted
          purchasePrice: Number(editedProperty.purchasePrice),
          purchaseFees: Number(editedProperty.purchaseFees),
          totalPurchaseAmount: Number(editedProperty.totalPurchaseAmount),
          estimatedCurrentValue: Number(editedProperty.estimatedCurrentValue),
          investmentRequired: Number(editedProperty.investmentRequired),
          potentialIncome: Number(editedProperty.potentialIncome),
          // Add MongoDB specific fields
          _id: property._id || property.id,
          id: property._id || property.id
        };
        await onSave(updatedProperty);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving property:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleCancel = () => {
    setEditedProperty(property);
    setIsEditing(false);
  };

  const handleChange = (field: keyof Property, value: string | number) => {
    setEditedProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Property Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{property.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  {isEditing ? (
                    <select
                      value={editedProperty.propertyType}
                      onChange={(e) => handleChange('propertyType', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{property.propertyType}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProperty.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{property.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedProperty.purchaseDate}
                      onChange={(e) => handleChange('purchaseDate', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{new Date(property.purchaseDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProperty.purchasePrice}
                      onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(property.purchasePrice)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Fees</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProperty.purchaseFees}
                      onChange={(e) => handleChange('purchaseFees', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(property.purchaseFees)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Purchase Amount</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProperty.totalPurchaseAmount}
                      onChange={(e) => handleChange('totalPurchaseAmount', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(property.totalPurchaseAmount)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Value</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProperty.estimatedCurrentValue}
                      onChange={(e) => handleChange('estimatedCurrentValue', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(property.estimatedCurrentValue)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Investment Required</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProperty.investmentRequired}
                      onChange={(e) => handleChange('investmentRequired', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(property.investmentRequired)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Potential Income</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProperty.potentialIncome}
                      onChange={(e) => handleChange('potentialIncome', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(property.potentialIncome)}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Usage After Investment</label>
                  {isEditing ? (
                    <textarea
                      value={editedProperty.usageAfterInvestment}
                      onChange={(e) => handleChange('usageAfterInvestment', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{property.usageAfterInvestment}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              {isPropertyManager() && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 