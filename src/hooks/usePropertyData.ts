import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Use ref to track the active request and pending operations
  const activeRequestRef = useRef<Promise<any> | null>(null);
  const pendingOperationsRef = useRef<(() => Promise<void>)[]>([]);

  const transformPropertyData = (data: any): Property => {
    return {
      id: String(data._id || data.id), // Ensure ID is always a string
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

  const executePendingOperations = useCallback(async () => {
    while (pendingOperationsRef.current.length > 0) {
      const operation = pendingOperationsRef.current.shift();
      if (operation) {
        await operation();
      }
    }
  }, []);

  const queueOperation = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    if (activeRequestRef.current) {
      return new Promise<T>((resolve, reject) => {
        pendingOperationsRef.current.push(async () => {
          try {
            const result = await operation();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    try {
      activeRequestRef.current = operation();
      const result = await activeRequestRef.current;
      return result;
    } finally {
      activeRequestRef.current = null;
      await executePendingOperations();
    }
  }, [executePendingOperations]);

  const fetchProperties = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    return queueOperation(async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let retries = 3;
        let lastError;
        
        while (retries > 0) {
          try {
            const response = await fetchWithAuth('/api/properties');
            
            if (!response.ok) {
              throw new Error('Failed to fetch properties');
            }
            
            const data = await response.json();
            
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
            
            const transformedProperties = propertiesArray.map(transformPropertyData);
            setProperties(transformedProperties);
            return transformedProperties;
          } catch (err) {
            lastError = err;
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
            }
          }
        }
        
        throw lastError;
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
        setProperties([]);
        throw err;
      } finally {
        setIsLoading(false);
      }
    });
  }, [fetchWithAuth, isAuthenticated, queueOperation]);

  // Initial fetch
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const addProperty = async (propertyData: Omit<Property, 'id'>) => {
    if (!isPropertyManager()) {
      throw new Error('Only property managers can add properties');
    }

    return queueOperation(async () => {
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
    });
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    if (!isPropertyManager()) {
      throw new Error('Only property managers can update properties');
    }

    return queueOperation(async () => {
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
    });
  };

  const deleteProperty = async (id: string) => {
    if (!isPropertyManager()) {
      throw new Error('Only property managers can delete properties');
    }

    return queueOperation(async () => {
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
    });
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