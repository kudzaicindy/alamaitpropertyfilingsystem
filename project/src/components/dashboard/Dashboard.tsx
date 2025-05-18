import React, { useState } from 'react';
import { usePropertyData } from '../../hooks/usePropertyData';
import { useInsuranceData } from '../../hooks/useInsuranceData';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Search, MapPin, Calendar } from 'lucide-react';
import { DashboardStats } from './DashboardStats';
import { PropertyTypeChart } from './PropertyTypeChart';
import { InsuranceOverview } from './InsuranceOverview';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { FloatingActionButton } from '../ui/FloatingActionButton';
import { PropertyForm } from '../property/PropertyForm';
import { InsuranceForm } from '../insurance/InsuranceForm';

interface Property {
  id: string;
  _id?: string;
  name: string;
  address: string;
  propertyType: string;
  purchaseDate: string;
  estimatedCurrentValue: number;
  totalPurchaseAmount: number;
}

interface Insurance {
  _id: string;
  type: 'property' | 'vehicle' | 'asset';
  [key: string]: any;
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'insurance'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isAddInsuranceModalOpen, setIsAddInsuranceModalOpen] = useState(false);
  const [insuranceType, setInsuranceType] = useState<'property' | 'vehicle' | 'asset'>('property');
  
  const {
    properties,
    isLoading: isPropertiesLoading,
    error: propertiesError,
    updateProperty,
    addProperty
  } = usePropertyData();

  const {
    propertyInsurance,
    vehicleInsurance,
    assetInsurance,
    isLoading: isInsuranceLoading,
    error: insuranceError,
    addInsurance,
    updateInsurance
  } = useInsuranceData();

  // Calculate totals
  const totalValue = properties.reduce((sum, property) => sum + (property.estimatedCurrentValue || 0), 0);
  const totalInvestment = properties.reduce((sum, property) => sum + (property.totalPurchaseAmount || 0), 0);
  const totalProperties = properties.length;

  // Calculate property type distribution
  const propertyTypeDistribution = properties.reduce((acc, property) => {
    const type = property.propertyType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter properties based on search query
  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.propertyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handleSaveProperty = async (updatedProperty: Property) => {
    try {
      const propertyId = updatedProperty.id || updatedProperty._id;
      if (!propertyId) {
        throw new Error('Property ID is required for update');
      }
      await updateProperty(propertyId, updatedProperty);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleAddProperty = () => {
    setIsAddPropertyModalOpen(true);
  };

  const handleCloseAddPropertyModal = () => {
    setIsAddPropertyModalOpen(false);
  };

  const handleSaveNewProperty = async (propertyData: Omit<Property, 'id' | '_id'>) => {
    try {
      await addProperty(propertyData);
      handleCloseAddPropertyModal();
    } catch (error) {
      console.error('Error adding property:', error);
    }
  };

  const handleAddInsurance = (type: 'property' | 'vehicle' | 'asset') => {
    setInsuranceType(type);
    setIsAddInsuranceModalOpen(true);
  };

  const handleCloseAddInsuranceModal = () => {
    setIsAddInsuranceModalOpen(false);
  };

  const handleUpdateInsurance = async (type: 'property' | 'vehicle' | 'asset', updatedInsurance: Insurance) => {
    try {
      if (!updatedInsurance._id) {
        throw new Error('Insurance ID is required for update');
      }
      await updateInsurance(type, updatedInsurance._id, updatedInsurance);
    } catch (error) {
      console.error('Error updating insurance:', error);
    }
  };

  const handleSaveNewInsurance = async (insuranceData: Omit<Insurance, '_id'>) => {
    try {
      await addInsurance({
        ...insuranceData,
        type: insuranceType
      });
      setIsAddInsuranceModalOpen(false);
    } catch (error) {
      console.error('Error adding insurance:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          
          {/* Stats Overview */}
          <DashboardStats
            propertyCount={totalProperties}
            totalValue={totalValue}
            totalInvestment={totalInvestment}
            propertyTypeDistribution={propertyTypeDistribution}
          />

          {/* Property Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PropertyTypeChart distribution={propertyTypeDistribution} />
          </div>

          {/* Main Tabs */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`${
                    activeTab === 'properties'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setActiveTab('insurance')}
                  className={`${
                    activeTab === 'insurance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  Insurance
                </button>
              </nav>
            </div>

            {/* Properties Tab Content */}
            {activeTab === 'properties' && (
              <div className="mt-6">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Property Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <Card key={property.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {property.propertyType}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-2" />
                              {property.address}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              Acquired: {new Date(property.purchaseDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="pt-4 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Current Value</span>
                              <span className="font-medium text-gray-900">{formatCurrency(property.estimatedCurrentValue)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                              <span className="text-gray-500">Investment</span>
                              <span className="font-medium text-gray-900">{formatCurrency(property.totalPurchaseAmount)}</span>
                            </div>
                          </div>
                          <div className="pt-4">
                            <button
                              onClick={() => handleViewDetails(property)}
                              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance Tab Content */}
            {activeTab === 'insurance' && (
              <div className="mt-6">
                <InsuranceOverview
                  vehicleInsurance={vehicleInsurance}
                  propertyInsurance={propertyInsurance}
                  assetInsurance={assetInsurance}
                  onUpdateInsurance={handleUpdateInsurance}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          property={selectedProperty}
          onSave={handleSaveProperty}
        />
      )}

      {/* Add Property Modal */}
      {isAddPropertyModalOpen && (
        <PropertyForm
          onSave={handleSaveNewProperty}
          onCancel={handleCloseAddPropertyModal}
          title="Add New Property"
        />
      )}

      {/* Add Insurance Modal */}
      {isAddInsuranceModalOpen && (
        <InsuranceForm
          type={insuranceType}
          onSave={handleSaveNewInsurance}
          onCancel={handleCloseAddInsuranceModal}
          title={`Add New ${insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)} Insurance`}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        activeTab={activeTab}
        onAddProperty={handleAddProperty}
        onAddInsurance={handleAddInsurance}
      />
    </div>
  );
} 