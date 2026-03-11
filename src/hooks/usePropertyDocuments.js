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

  const getPropertyDocument = useCallback(async (id) => {
    if (!id || !isAuthenticated) return null;
    try {
      const res = await fetchWithAuth(`/api/property-documents/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  }, [fetchWithAuth, isAuthenticated]);

  const updatePropertyDocument = useCallback(async (id, body) => {
    const res = await fetchWithAuth(`/api/property-documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || json.error || 'Update failed');
    }
    await fetchPropertyDocuments();
    return res.json();
  }, [fetchWithAuth, fetchPropertyDocuments]);

  const deletePropertyDocument = useCallback(async (id) => {
    const res = await fetchWithAuth(`/api/property-documents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || json.error || 'Delete failed');
    }
    await fetchPropertyDocuments();
  }, [fetchWithAuth, fetchPropertyDocuments]);

  return {
    propertyDocuments,
    isLoading: loading,
    error,
    refreshPropertyDocuments: fetchPropertyDocuments,
    getPropertyDocument,
    updatePropertyDocument,
    deletePropertyDocument,
  };
}

