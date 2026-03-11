import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useInsuranceData() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [propertyInsurance, setPropertyInsurance] = useState([]);
  const [carInsurance, setCarInsurance] = useState([]);
  const [insuranceCover, setInsuranceCover] = useState([]);
  const [insuredCover, setInsuredCover] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch property insurance, insured cover, and generic covers using the dedicated endpoints.
  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Property insurance: /api/insurance/property
      const propRes = await fetchWithAuth('/api/insurance/property');
      if (!propRes.ok) throw new Error('Failed to fetch property insurance');
      const propJson = await propRes.json();
      const propList = propJson.success && Array.isArray(propJson.data) ? propJson.data : [];
      setPropertyInsurance(propList);

      // Insured cover (Asset Cover): /api/insurance/insured-cover
      try {
        const coverRes = await fetchWithAuth('/api/insurance/insured-cover');
        const coverJson = await coverRes.json();
        const coverList = coverRes.ok && coverJson.success && Array.isArray(coverJson.data) ? coverJson.data : [];
        setInsuredCover(coverList);
      } catch {
        setInsuredCover([]);
      }

      // Legacy insurance covers: /api/insurance/covers (fallback)
      try {
        const coversRes = await fetchWithAuth('/api/insurance/covers');
        const coversJson = await coversRes.json();
        const coversList = coversRes.ok && coversJson.success && Array.isArray(coversJson.data) ? coversJson.data : [];
        setInsuranceCover(coversList);
      } catch {
        setInsuranceCover([]);
      }

      // Vehicle / car insurance left as-is for now
      setCarInsurance((prev) => prev || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch insurance');
      setPropertyInsurance([]);
      setCarInsurance([]);
      setInsuranceCover([]);
      setInsuredCover([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const updateInsurance = async (type, id, data) => {
    const path =
      type === 'property'
        ? null
        : type === 'vehicle' || type === 'car'
          ? `/api/insurance/cars/${data._id || id}`
          : `/api/insurance/covers/${data._id || id}`;
    if (!path) throw new Error('No dedicated endpoint for property insurance update');
    const res = await fetchWithAuth(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated = await res.json();
    const payload = updated.data ?? updated;
    if (type === 'vehicle' || type === 'car') {
      setCarInsurance((prev) =>
        prev.map((i) => ((i._id || i.id) === (payload._id || payload.id) ? payload : i))
      );
    } else {
      setInsuranceCover((prev) =>
        prev.map((i) => ((i._id || i.id) === (payload._id || payload.id) ? payload : i))
      );
    }
    return payload;
  };

  const addInsurance = async (data) => {
    const type = data.type || 'cover';
    const path =
      type === 'property'
        ? null
        : type === 'vehicle' || type === 'car'
          ? '/api/insurance/cars'
          : '/api/insurance/covers';
    if (!path) throw new Error('No dedicated endpoint for property insurance create');
    const res = await fetchWithAuth(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add');
    const json = await res.json();
    const created = json.data ?? json;
    if (type === 'vehicle' || type === 'car') {
      setCarInsurance((prev) => [...prev, created]);
    } else {
      setInsuranceCover((prev) => [...prev, created]);
    }
    return created;
  };

  return {
    propertyInsurance,
    carInsurance,
    insuranceCover,
    insuredCover,
    vehicleInsurance: carInsurance,
    assetInsurance: insuredCover.length ? insuredCover : insuranceCover,
    isLoading: loading,
    error,
    updateInsurance,
    addInsurance,
    refreshInsuranceData: fetchData,
  };
}
