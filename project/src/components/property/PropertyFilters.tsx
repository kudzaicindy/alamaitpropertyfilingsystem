import React from 'react';
import { Filter } from 'lucide-react';
import { PropertyFilterKey } from '../../types/property';

type PropertyFiltersProps = {
  filterKey: PropertyFilterKey | '';
  setFilterKey: (key: PropertyFilterKey | '') => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
};

export function PropertyFilters({ 
  filterKey, 
  setFilterKey, 
  filterValue, 
  setFilterValue 
}: PropertyFiltersProps) {
  const handleFilterKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterKey(e.target.value as PropertyFilterKey | '');
    setFilterValue('');
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  const handleClearFilters = () => {
    setFilterKey('');
    setFilterValue('');
  };

  const renderFilterValueInput = () => {
    if (!filterKey) return null;

    switch (filterKey) {
      case 'propertyType':
        return (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All types</option>
            <option value="House">House</option>
            <option value="Land">Land</option>
            <option value="Flat">Flat</option>
            <option value="Cottage">Cottage</option>
            <option value="Cluster">Cluster</option>
          </select>
        );
      case 'ownedEntity':
        return (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All entities</option>
            <option value="SC">SC</option>
            <option value="Alamait">Alamait</option>
            <option value="Maitalan">Maitalan</option>
            <option value="TMT">TMT</option>
            <option value="VV">VV</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={filterValue}
            onChange={handleFilterValueChange}
            placeholder="Enter value..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Filter Properties</h3>
        {(filterKey || filterValue) && (
          <button
            onClick={handleClearFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="filterKey" className="block text-xs font-medium text-gray-500 mb-1">
            Filter by
          </label>
          <select
            id="filterKey"
            value={filterKey}
            onChange={handleFilterKeyChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a field</option>
            <option value="name">Property Name</option>
            <option value="propertyType">Property Type</option>
            <option value="ownedEntity">Owned Entity</option>
            <option value="purchaseDate">Purchase Date</option>
            <option value="usageAfterInvestment">Usage</option>
          </select>
        </div>
        
        {filterKey && (
          <div>
            <label htmlFor="filterValue" className="block text-xs font-medium text-gray-500 mb-1">
              Value
            </label>
            {renderFilterValueInput()}
          </div>
        )}
      </div>
    </div>
  );
}