import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function usePropertyDocuments() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [propertyDocuments, setPropertyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPropertyDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth('/api/property-documents');
      if (!res.ok) throw new Error('Failed to fetch property documents');
      const json = await res.json();
      const list = json.success && Array.isArray(json.data) ? json.data : [];
      setPropertyDocuments(list);
    } catch (e) {
      setError(e.message || 'Failed to fetch property documents');
      setPropertyDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, isAuthenticated]);

  useEffect(() => {
    fetchPropertyDocuments();
  }, [fetchPropertyDocuments]);

  return {
    propertyDocuments,
    isLoading: loading,
    error,
    refreshPropertyDocuments: fetchPropertyDocuments,
  };
}

