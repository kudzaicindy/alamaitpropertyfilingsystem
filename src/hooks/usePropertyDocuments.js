import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../config/api';

function isPropertyDocumentRecord(row) {
  if (!row || typeof row !== 'object') return false;
  const hasPropertyName = !!String(row.propertyName || '').trim();
  const hasRegisterFields = (
    row.titleDeedsPhysicalLocation !== undefined ||
    row.titleDeedsDigitalDescription !== undefined ||
    row.plansDescription !== undefined ||
    row.permitsDescription !== undefined ||
    row.leaseAgreementDescription !== undefined ||
    row.fileLocationNotes !== undefined
  );
  // Property-document rows can legitimately also carry uploaded document metadata.
  return hasPropertyName && hasRegisterFields;
}

export function usePropertyDocuments() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [propertyDocuments, setPropertyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPropertyDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth('/api/property-documents');
      if (!res.ok) throw new Error('Failed to fetch property documents');
      const json = await res.json();
      const list = json.success && Array.isArray(json.data) ? json.data : [];
      const filtered = list.filter(isPropertyDocumentRecord);
      setPropertyDocuments(filtered);
      return filtered;
    } catch (e) {
      setError(e.message || 'Failed to fetch property documents');
      setPropertyDocuments([]);
      return [];
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

  const uploadPropertyDocumentFile = async (id, formData) => {
    if (!id) throw new Error('Missing property document id');
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const base = API_BASE_URL.replace(/\/api$/, '') || API_BASE_URL;
    const res = await fetch(`${base}/api/property-documents/${id}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || json.error || 'Upload failed');
    await fetchPropertyDocuments();
    return json;
  };

  return {
    propertyDocuments,
    isLoading: loading,
    error,
    refreshPropertyDocuments: fetchPropertyDocuments,
    getPropertyDocument,
    updatePropertyDocument,
    deletePropertyDocument,
    uploadPropertyDocumentFile,
  };
}

