import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { VehicleInsurance, PropertyInsurance, AssetInsurance } from '../../types/insurance';
import { Car, Home, Briefcase, Eye } from 'lucide-react';
import { InsuranceDetailsModal } from './InsuranceDetailsModal';

type InsuranceOverviewProps = {
  vehicleInsurance: VehicleInsurance[];
  propertyInsurance: PropertyInsurance[];
  assetInsurance: AssetInsurance[];
  onUpdateInsurance?: (type: 'vehicle' | 'property' | 'asset', updatedInsurance: any) => void;
};

export function InsuranceOverview({ 
  vehicleInsurance, 
  propertyInsurance, 
  assetInsurance,
  onUpdateInsurance 
}: InsuranceOverviewProps) {
  const [activeTab, setActiveTab] = useState('vehicle');
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewDetails = (insurance: any) => {
    setSelectedInsurance(insurance);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInsurance(null);
  };

  const handleSaveInsurance = async (updatedInsurance: any) => {
    try {
      if (onUpdateInsurance) {
        // Use either _id or id field
        const insuranceId = updatedInsurance._id || updatedInsurance.id;
        if (!insuranceId) {
          console.error('Insurance object:', updatedInsurance);
          throw new Error('Insurance ID is required for update');
        }
        
        await onUpdateInsurance(activeTab as 'vehicle' | 'property' | 'asset', {
          ...updatedInsurance,
          _id: insuranceId // Use the found ID as _id
        });
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating insurance:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-6">
      {/* Insurance Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Insurance Tabs">
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`${
              activeTab === 'vehicle'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center`}
          >
            <Car className="h-5 w-5 mr-2" />
            Vehicle Insurance
          </button>
          <button
            onClick={() => setActiveTab('property')}
            className={`${
              activeTab === 'property'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center`}
          >
            <Home className="h-5 w-5 mr-2" />
            Property Insurance
          </button>
          <button
            onClick={() => setActiveTab('asset')}
            className={`${
              activeTab === 'asset'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center`}
          >
            <Briefcase className="h-5 w-5 mr-2" />
            Asset Insurance
          </button>
        </nav>
      </div>

      {/* Vehicle Insurance Tab */}
      {activeTab === 'vehicle' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vehicle Insurance</h3>
              <Car className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsible Person</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Payment</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Premium</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount Insured</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicleInsurance.map((insurance) => (
                    <tr key={insurance.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.carDetails}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.responsiblePerson}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Badge variant="primary">{insurance.insurer}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.nextPaymentDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(insurance.termlyPremium)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(insurance.amountInsured)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={() => handleViewDetails(insurance)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Insurance Tab */}
      {activeTab === 'property' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Property Insurance</h3>
              <Home className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Payment</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Premium</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount Insured</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {propertyInsurance.map((insurance) => (
                    <tr key={insurance.propertyRef} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.propertyName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Badge variant="primary">{insurance.insurer}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.nextPaymentDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(insurance.termlyPremium)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(insurance.amountInsured)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={() => handleViewDetails(insurance)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Insurance Tab */}
      {activeTab === 'asset' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Asset Insurance</h3>
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Payment</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Premium</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount Insured</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assetInsurance.map((insurance) => (
                    <tr key={insurance.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.cover}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Badge variant="primary">{insurance.insurer}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{insurance.nextPaymentDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(insurance.termlyPremium)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(insurance.amountInsured)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={() => handleViewDetails(insurance)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insurance Details Modal */}
      {selectedInsurance && (
        <InsuranceDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          insurance={selectedInsurance}
          type={activeTab as 'vehicle' | 'property' | 'asset'}
          onSave={handleSaveInsurance}
        />
      )}
    </div>
  );
} 