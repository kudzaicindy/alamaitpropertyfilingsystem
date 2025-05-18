import React, { useState } from 'react';
import { usePropertyData } from './hooks/usePropertyData';
import { useInsuranceData } from './hooks/useInsuranceData';
import { Property } from './types/property';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { useAuth } from './hooks/useAuth';

import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { DashboardStats } from './components/dashboard/DashboardStats';
import { PropertyTypeChart } from './components/dashboard/PropertyTypeChart';
import { PropertyList } from './components/property/PropertyList';
import { PropertyDetail } from './components/property/PropertyDetail';
import { PropertyForm } from './components/property/PropertyForm';
import { PropertyFilters } from './components/property/PropertyFilters';
import { InsuranceOverview } from './components/insurance/InsuranceOverview';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
};

// Properties Page component
function PropertiesPage() {
  const {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    searchQuery,
    setSearchQuery,
    filterKey,
    setFilterKey,
    filterValue,
    setFilterValue,
    isLoading,
    error
  } = usePropertyData();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Property
            </button>
          </div>

          <div className="mt-8">
            <PropertyFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterKey={filterKey}
              setFilterKey={setFilterKey}
              filterValue={filterValue}
              setFilterValue={setFilterValue}
            />
          </div>

          <div className="mt-8">
            <PropertyList
              properties={properties}
              onSelectProperty={setSelectedProperty}
              onEditProperty={setEditingProperty}
              onDeleteProperty={deleteProperty}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {isFormOpen && (
            <PropertyForm
              property={editingProperty}
              onSave={async (data) => {
                if (editingProperty) {
                  await updateProperty(editingProperty.id, data);
                } else {
                  await addProperty(data);
                }
                setIsFormOpen(false);
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          )}

          {selectedProperty && (
            <PropertyDetail
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
              onEdit={() => {
                setEditingProperty(selectedProperty);
                setSelectedProperty(null);
                setIsFormOpen(true);
              }}
              onDelete={async () => {
                await deleteProperty(selectedProperty.id);
                setSelectedProperty(null);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Insurance Page component
function InsurancePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Insurance</h1>
          <div className="mt-8">
            <InsuranceOverview />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    searchQuery,
    setSearchQuery,
    filterKey,
    setFilterKey,
    filterValue,
    setFilterValue,
    totalValue,
    totalInvestment,
    propertyTypeDistribution,
    ownershipDistribution,
    isLoading: isPropertiesLoading,
    error: propertiesError
  } = usePropertyData();

  const {
    propertyInsurance,
    vehicleInsurance,
    assetInsurance,
    isLoading: isInsuranceLoading,
    error: insuranceError
  } = useInsuranceData();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'properties' | 'insurance'>('properties');
  const [insuranceTab, setInsuranceTab] = useState<'property' | 'cars' | 'cover'>('property');
  const [operationError, setOperationError] = useState<string | null>(null);

  const handleOpenAddForm = () => {
    setEditingProperty(undefined);
    setIsFormOpen(true);
    setOperationError(null);
  };

  const handleOpenEditForm = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
    setSelectedProperty(null);
    setOperationError(null);
  };

  const handleSaveProperty = async (propertyData: Omit<Property, 'id'>) => {
    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyData);
      } else {
        await addProperty(propertyData);
      }
      setIsFormOpen(false);
      setOperationError(null);
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Failed to save property');
    }
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleDeleteProperty = async (property: Property) => {
    try {
      await deleteProperty(property.id);
      setSelectedProperty(null);
      setOperationError(null);
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Failed to delete property');
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <PropertiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <ProtectedRoute>
              <PropertyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/new"
          element={
            <ProtectedRoute>
              <PropertyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insurance"
          element={
            <ProtectedRoute>
              <InsurancePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;