import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Property } from '../../types/property';
import { Button } from '../ui/Button';

type PropertyFormProps = {
  property?: Property;
  onSave: (property: Omit<Property, 'id'>) => void;
  onCancel: () => void;
  title: string;
};

export function PropertyForm({ property, onSave, onCancel, title }: PropertyFormProps) {
  const [formData, setFormData] = useState<Omit<Property, 'id'>>({
    name: '',
    address: '',
    propertyType: 'House',
    purchaseDate: '',
    ownedEntity: '',
    purchasePrice: 0,
    purchaseFees: 0,
    totalPurchaseAmount: 0,
    estimatedCurrentValue: 0,
    investmentRequired: 0,
    usageAfterInvestment: '',
    potentialIncome: 0
  });

  useEffect(() => {
    if (property) {
      const { id, ...rest } = property;
      setFormData(rest);
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let parsedValue = value;
    if (name === 'purchasePrice' || name === 'purchaseFees' || name === 'estimatedCurrentValue' || 
        name === 'investmentRequired' || name === 'potentialIncome') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: parsedValue };
      
      // Auto-calculate total purchase amount
      if (name === 'purchasePrice' || name === 'purchaseFees') {
        const price = name === 'purchasePrice' ? parsedValue : prev.purchasePrice;
        const fees = name === 'purchaseFees' ? parsedValue : prev.purchaseFees;
        newData.totalPurchaseAmount = (price as number) + (fees as number);
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="House">House</option>
                <option value="Land">Land</option>
                <option value="Flat">Flat</option>
                <option value="Cottage">Cottage</option>
                <option value="Cluster">Cluster</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="text"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                placeholder="e.g. January 2023"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="ownedEntity" className="block text-sm font-medium text-gray-700 mb-1">
                Owned Entity
              </label>
              <input
                type="text"
                id="ownedEntity"
                name="ownedEntity"
                value={formData.ownedEntity}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price
              </label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="purchaseFees" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Fees
              </label>
              <input
                type="number"
                id="purchaseFees"
                name="purchaseFees"
                value={formData.purchaseFees}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="totalPurchaseAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Total Purchase Amount
              </label>
              <input
                type="number"
                id="totalPurchaseAmount"
                name="totalPurchaseAmount"
                value={formData.totalPurchaseAmount}
                readOnly
                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>
            
            <div>
              <label htmlFor="estimatedCurrentValue" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Current Value
              </label>
              <input
                type="number"
                id="estimatedCurrentValue"
                name="estimatedCurrentValue"
                value={formData.estimatedCurrentValue}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="investmentRequired" className="block text-sm font-medium text-gray-700 mb-1">
                Investment Required
              </label>
              <input
                type="number"
                id="investmentRequired"
                name="investmentRequired"
                value={formData.investmentRequired}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="usageAfterInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                Usage After Investment
              </label>
              <input
                type="text"
                id="usageAfterInvestment"
                name="usageAfterInvestment"
                value={formData.usageAfterInvestment}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="potentialIncome" className="block text-sm font-medium text-gray-700 mb-1">
                Potential Monthly Income
              </label>
              <input
                type="number"
                id="potentialIncome"
                name="potentialIncome"
                value={formData.potentialIncome}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              className="mr-3"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Save Property
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}