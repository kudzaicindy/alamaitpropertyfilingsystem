import React, { useState } from 'react';
import { X, Edit2, Save, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';

type InsuranceDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  insurance: any; // This will be either VehicleInsurance, PropertyInsurance, or AssetInsurance
  type: 'vehicle' | 'property' | 'asset';
  onSave?: (updatedInsurance: any) => void;
};

export function InsuranceDetailsModal({ isOpen, onClose, insurance, type, onSave }: InsuranceDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInsurance, setEditedInsurance] = useState(insurance);
  const { user } = useAuth();
  const isPropertyManager = user?.role === 'property_manager';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!isOpen) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        // Ensure we're passing the complete insurance object with all required fields
        const updatedInsurance = {
          ...insurance,
          ...editedInsurance,
          // Ensure these fields are properly formatted
          termlyPremium: Number(editedInsurance.termlyPremium),
          amountInsured: Number(editedInsurance.amountInsured),
          nextPaymentDate: editedInsurance.nextPaymentDate || insurance.nextPaymentDate,
          // Add MongoDB specific fields
          _id: insurance._id || insurance.id,
          id: insurance._id || insurance.id
        };
        await onSave(updatedInsurance);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving insurance:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleCancel = () => {
    setEditedInsurance(insurance);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string | number) => {
    setEditedInsurance((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {type === 'vehicle' ? 'Vehicle' : type === 'property' ? 'Property' : 'Asset'} Insurance Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {type === 'vehicle' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Car Details</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedInsurance.carDetails}
                          onChange={(e) => handleChange('carDetails', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{insurance.carDetails}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Responsible Person</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedInsurance.responsiblePerson}
                          onChange={(e) => handleChange('responsiblePerson', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{insurance.responsiblePerson}</p>
                      )}
                    </div>
                  </>
                )}
                {type === 'property' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Property Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedInsurance.propertyName}
                          onChange={(e) => handleChange('propertyName', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{insurance.propertyName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedInsurance.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{insurance.address}</p>
                      )}
                    </div>
                  </>
                )}
                {type === 'asset' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cover</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedInsurance.cover}
                          onChange={(e) => handleChange('cover', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{insurance.cover}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedInsurance.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{insurance.address}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Insurance Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurer</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedInsurance.insurer}
                      onChange={(e) => handleChange('insurer', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <Badge variant="primary" className="mt-1">{insurance.insurer}</Badge>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Next Payment Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedInsurance.nextPaymentDate}
                      onChange={(e) => handleChange('nextPaymentDate', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{insurance.nextPaymentDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Premium</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedInsurance.termlyPremium}
                      onChange={(e) => handleChange('termlyPremium', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(insurance.termlyPremium)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount Insured</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedInsurance.amountInsured}
                      onChange={(e) => handleChange('amountInsured', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(insurance.amountInsured)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              {isPropertyManager && !isEditing && (
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