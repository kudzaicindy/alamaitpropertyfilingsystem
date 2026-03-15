import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Assets API: GET /api/assets, GET /api/assets?propertyName=..., POST, PATCH, DELETE
 * Model: name, propertyName, quantity, category, condition, notes
 */
export function useAssets() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async (propertyName) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const query = propertyName ? `?propertyName=${encodeURIComponent(propertyName)}` : '';
      const res = await fetchWithAuth(`/api/assets${query}`);
      if (!res.ok) throw new Error('Failed to fetch assets');
      const json = await res.json();
      const list = json.success && Array.isArray(json.data) ? json.data : [];
      setAssets(list);
    } catch (e) {
      setError(e.message || 'Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, isAuthenticated]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = useCallback(async (body) => {
    const res = await fetchWithAuth('/api/assets', {
      method: 'POST',
      body: JSON.stringify({
        name: body.name || body.n,
        propertyName: body.propertyName || body.property,
        quantity: body.quantity ?? body.q ?? 1,
        category: body.category || '',
        condition: body.condition || '',
        notes: body.notes || '',
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.message || j.error || 'Failed to add asset');
    }
    const json = await res.json();
    const created = json.data ?? json;
    setAssets(prev => [...prev, created]);
    return created;
  }, [fetchWithAuth]);

  const updateAsset = useCallback(async (id, body) => {
    const res = await fetchWithAuth(`/api/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.message || j.error || 'Failed to update asset');
    }
    const json = await res.json();
    const updated = json.data ?? json;
    setAssets(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, ...updated } : a));
    return updated;
  }, [fetchWithAuth]);

  const deleteAsset = useCallback(async (id) => {
    const res = await fetchWithAuth(`/api/assets/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.message || j.error || 'Failed to delete asset');
    }
    setAssets(prev => prev.filter(a => a._id !== id && a.id !== id));
  }, [fetchWithAuth]);

  return {
    assets,
    isLoading: loading,
    error,
    refreshAssets: fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
  };
}
