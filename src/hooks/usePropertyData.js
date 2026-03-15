import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../config/api';

function transform(p) {
  return {
    id: String(p._id || p.id),
    _id: p._id,
    name: p.name || '',
    address: p.address || '',
    propertyType: p.propertyType || 'House',
    purchaseDate: p.purchaseDate || '',
    totalPurchaseAmount: Number(p.totalPurchaseAmount ?? p.purchasePrice) || 0,
    purchaseFees: Number(p.purchaseFees) || 0,
    estimatedCurrentValue: Number(p.estimatedCurrentValue) || 0,
    ownedEntity: p.ownedEntity || p.entity || '',
    usage: p.usage || p.usageAfterInvestment || '',
    insured: p.insured ?? (p.insurance === 'Yes' || p.ins === 'Yes'),
    insurer: p.insurer || '',
    termlyPremium: Number(p.termlyPremium ?? p.prem) || 0,
    sumInsured: Number(p.sumInsured ?? p.sum) || 0,
    nextPayment: p.nextPayment || p.next || '',
    investmentRequired: Number(p.investmentRequired) || 0,
    potentialIncome: Number(p.potentialIncome) || 0
  };
}

export function usePropertyData() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth('/api/properties');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.properties || data.data || data.results || [];
      setProperties(list.map(transform));
    } catch (e) {
      setError(e.message || 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, isAuthenticated]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const addProperty = async (data) => {
    const payload = {
      ...data,
      purchasePrice: data.purchasePrice ?? data.totalPurchaseAmount,
      totalPurchaseAmount: data.totalPurchaseAmount ?? data.purchasePrice
    };
    const res = await fetchWithAuth('/api/properties', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add');
    const created = await res.json();
    setProperties(prev => [...prev, transform(created)]);
    return transform(created);
  };

  const updateProperty = async (id, data) => {
    const res = await fetchWithAuth(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated = await res.json();
    setProperties(prev => prev.map(p => p.id === id ? transform(updated) : p));
    return transform(updated);
  };

  const deleteProperty = async (id) => {
    const res = await fetchWithAuth(`/api/properties/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.message || j.error || 'Failed to delete property');
    }
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return {
    properties,
    isLoading: loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    refreshProperties: fetchProperties
  };
}
