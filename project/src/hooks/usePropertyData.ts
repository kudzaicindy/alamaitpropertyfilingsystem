import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Property } from '../types/property';

export function usePropertyData() {
  const { fetchWithAuth, isAuthenticated, isPropertyManager } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKey, setFilterKey] = useState<keyof Property>('name');
  const [filterValue, setFilterValue] = useState('');

  const transformPropertyData = (data: any): Property => {
    return {
      id: data._id || data.id,
      name: data.name || '',
      address: data.address || '',
      propertyType: data.propertyType || 'House',
      purchaseDate: data.purchaseDate || '',
      ownedEntity: data.ownedEntity || '',
      purchasePrice: Number(data.purchasePrice) || 0,
      purchaseFees: Number(data.purchaseFees) || 0,
      totalPurchaseAmount: Number(data.totalPurchaseAmount) || 0,
      estimatedCurrentValue: Number(data.estimatedCurrentValue) || 0,
      investmentRequired: Number(data.investmentRequired) || 0,
      usageAfterInvestment: data.usageAfterInvestment || '',
      potentialIncome: Number(data.potentialIncome) || 0,
      documents: Array.isArray(data.documents) ? data.documents : []
    };
  };

  const fetchProperties = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

      try {
        setIsLoading(true);
      setError(null);
      const response = await fetchWithAuth('/api/properties');
        
        if (!response.ok) {
        throw new Error('Failed to fetch properties');
        }
        
        const data = await response.json();
        
      // Handle different response formats
      let propertiesArray: any[] = [];
      if (Array.isArray(data)) {
        propertiesArray = data;
      } else if (data.properties && Array.isArray(data.properties)) {
        propertiesArray = data.properties;
      } else if (data.data && Array.isArray(data.data)) {
        propertiesArray = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        propertiesArray = data.results;
      } else {
        console.error('Unexpected API response format:', data);
          throw new Error('Invalid data format received from server');
        }
        
      // Transform the data to match our Property interface
      const transformedProperties = propertiesArray.map(transformPropertyData);
      setProperties(transformedProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      setProperties([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
  }, [fetchWithAuth, isAuthenticated]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const addProperty = async (propertyData: Omit<Property, 'id'>) => {
    if (!isPropertyManager()) {
      throw new Error('Only property managers can add properties');
    }

    try {
      setError(null);
      const response = await fetchWithAuth('/api/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        throw new Error('Failed to add property');
      }

      const newProperty = await response.json();
      const transformedProperty = transformPropertyData(newProperty);
      setProperties(prev => [...prev, transformedProperty]);
      return transformedProperty;
    } catch (err) {
      console.error('Error adding property:', err);
      setError(err instanceof Error ? err.message : 'Failed to add property');
      throw err;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    if (!isPropertyManager()) {
      throw new Error('Only property managers can update properties');
    }

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update property');
      }

      const updatedProperty = await response.json();
      const transformedProperty = transformPropertyData(updatedProperty);
      setProperties(prev => prev.map(p => p.id === id ? transformedProperty : p));
      return transformedProperty;
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    if (!isPropertyManager()) {
      throw new Error('Only property managers can delete properties');
    }

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/properties/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete property');
      throw err;
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterValue || String(property[filterKey]).toLowerCase().includes(filterValue.toLowerCase());
      return matchesSearch && matchesFilter;
    });

  return {
    properties: filteredProperties,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterKey,
    setFilterKey,
    filterValue,
    setFilterValue,
    addProperty,
    updateProperty,
    deleteProperty,
    refreshProperties: fetchProperties,
    canEdit: isPropertyManager()
  };
}