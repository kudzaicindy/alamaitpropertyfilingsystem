import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface BaseInsurance {
  id: string;
  insurer: string;
  nextPaymentDate: string;
  termlyPremium: number;
  amountInsured: number;
  createdAt: string;
  updatedAt: string;
}

interface PropertyInsurance extends BaseInsurance {
  propertyRef: string;
  propertyName: string;
  address: string;
}

interface VehicleInsurance extends BaseInsurance {
  carDetails: string;
  responsiblePerson: string;
}

interface AssetInsurance extends BaseInsurance {
  cover: string;
  address: string;
}

export function useInsuranceData() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [propertyInsurance, setPropertyInsurance] = useState<PropertyInsurance[]>([]);
  const [vehicleInsurance, setVehicleInsurance] = useState<VehicleInsurance[]>([]);
  const [assetInsurance, setAssetInsurance] = useState<AssetInsurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsuranceData = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping insurance data fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting to fetch insurance data...');

      const [propertyRes, vehicleRes, assetRes] = await Promise.all([
        fetchWithAuth('/api/insurance/propertyinsured'),
        fetchWithAuth('/insuredcars'),
        fetchWithAuth('/api/insurance/insuredcover')
      ]);

      console.log('Insurance API responses:', {
        property: propertyRes.status,
        vehicle: vehicleRes.status,
        asset: assetRes.status
      });

      if (!propertyRes.ok || !vehicleRes.ok || !assetRes.ok) {
        const propertyText = await propertyRes.text();
        const vehicleText = await vehicleRes.text();
        const assetText = await assetRes.text();
        
        console.error('API Error Responses:', {
          property: {
            status: propertyRes.status,
            text: propertyText
          },
          vehicle: {
            status: vehicleRes.status,
            text: vehicleText
          },
          asset: {
            status: assetRes.status,
            text: assetText
          }
        });
        
        throw new Error('Failed to fetch insurance data');
      }

      const propertyData = await propertyRes.json();
      const vehicleData = await vehicleRes.json();
      const assetData = await assetRes.json();

      console.log('Fetched insurance data:', {
        property: propertyData.data?.length || 0,
        vehicle: vehicleData.data?.length || 0,
        asset: assetData.data?.length || 0
      });

      // Transform the data to match our interfaces
      const transformInsuranceData = (data: any, type: 'property' | 'vehicle' | 'asset') => {
        if (!Array.isArray(data)) {
          console.error(`Invalid data format for ${type} insurance:`, data);
          return [];
        }
        return data.map((item: any) => ({
          id: item._id || item.id,
          insurer: item.insurer || '',
          nextPaymentDate: item.nextPaymentDate || '',
          termlyPremium: Number(item.termlyPremium) || 0,
          amountInsured: Number(item.amountInsured) || 0,
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || '',
          ...(type === 'property' && {
            propertyRef: item.propertyRef || '',
            propertyName: item.propertyName || '',
            address: item.address || ''
          }),
          ...(type === 'vehicle' && {
            carDetails: item.carDetails || '',
            responsiblePerson: item.responsiblePerson || ''
          }),
          ...(type === 'asset' && {
            cover: item.cover || '',
            address: item.address || ''
          })
        }));
      };

      setPropertyInsurance(transformInsuranceData(propertyData.data || [], 'property'));
      setVehicleInsurance(transformInsuranceData(vehicleData.data || [], 'vehicle'));
      setAssetInsurance(transformInsuranceData(assetData.data || [], 'asset'));
    } catch (err) {
      console.error('Error fetching insurance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch insurance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsuranceData();
  }, [isAuthenticated]);

  const updateInsurance = async (type: 'property' | 'vehicle' | 'asset', id: string, data: any) => {
    try {
      setError(null);
      const endpoint = type === 'property' ? 'propertyinsured' : type === 'vehicle' ? 'insuredcars' : 'insuredcover';
      
      // Ensure we're using the MongoDB _id
      const mongoId = data._id || id;
      
      const response = await fetchWithAuth(`/api/insurance/${endpoint}/${mongoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          _id: mongoId // Ensure _id is included in the request body
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update insurance');
      }

      const updatedInsurance = await response.json();
      
      // Transform the response to match our interface
      const transformedInsurance = {
        id: updatedInsurance._id || updatedInsurance.id,
        insurer: updatedInsurance.insurer || '',
        nextPaymentDate: updatedInsurance.nextPaymentDate || '',
        termlyPremium: Number(updatedInsurance.termlyPremium) || 0,
        amountInsured: Number(updatedInsurance.amountInsured) || 0,
        createdAt: updatedInsurance.createdAt || '',
        updatedAt: updatedInsurance.updatedAt || '',
        ...(type === 'property' && {
          propertyRef: updatedInsurance.propertyRef || '',
          propertyName: updatedInsurance.propertyName || '',
          address: updatedInsurance.address || ''
        }),
        ...(type === 'vehicle' && {
          carDetails: updatedInsurance.carDetails || '',
          responsiblePerson: updatedInsurance.responsiblePerson || ''
        }),
        ...(type === 'asset' && {
          cover: updatedInsurance.cover || '',
          address: updatedInsurance.address || ''
        })
      };
      
      // Update the appropriate state based on insurance type
      if (type === 'property') {
        setPropertyInsurance(prev => prev.map(ins => ins.id === transformedInsurance.id ? transformedInsurance : ins));
      } else if (type === 'vehicle') {
        setVehicleInsurance(prev => prev.map(ins => ins.id === transformedInsurance.id ? transformedInsurance : ins));
      } else {
        setAssetInsurance(prev => prev.map(ins => ins.id === transformedInsurance.id ? transformedInsurance : ins));
      }

      return transformedInsurance;
    } catch (err) {
      console.error('Error updating insurance:', err);
      setError(err instanceof Error ? err.message : 'Failed to update insurance');
      throw err;
    }
  };

  const addInsurance = async (data: any) => {
    try {
      setError(null);
      const type = data.type || 'property';
      const endpoint = type === 'property' ? 'propertyinsured' : type === 'vehicle' ? 'insuredcars' : 'insuredcover';
      
      const response = await fetchWithAuth(`/api/insurance/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to add insurance');
      }

      const newInsurance = await response.json();
      
      // Update the appropriate state based on insurance type
      if (type === 'property') {
        setPropertyInsurance(prev => [...prev, newInsurance]);
      } else if (type === 'vehicle') {
        setVehicleInsurance(prev => [...prev, newInsurance]);
      } else {
        setAssetInsurance(prev => [...prev, newInsurance]);
      }

      return newInsurance;
    } catch (err) {
      console.error('Error adding insurance:', err);
      setError(err instanceof Error ? err.message : 'Failed to add insurance');
      throw err;
    }
  };

  return {
    propertyInsurance,
    vehicleInsurance,
    assetInsurance,
    isLoading,
    error,
    updateInsurance,
    addInsurance,
    refreshInsuranceData: fetchInsuranceData
  };
} 