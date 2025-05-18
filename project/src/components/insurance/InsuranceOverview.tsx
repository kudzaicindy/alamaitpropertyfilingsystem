import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { InsuranceForm } from './InsuranceForm';
import { useInsuranceData } from '../../hooks/useInsuranceData';

interface InsuranceData {
  id?: number;
  propertyRef?: number;
  carRef?: string;
  propertyName?: string;
  carDetails?: string;
  cover?: string;
  address: string;
  responsiblePerson?: string;
  insured: boolean;
  insurer: string;
  nextPaymentDate: string;
  termlyPremium: number;
  monthlyPayment?: number | null;
  yearlyPremium?: number;
  amountInsured: number;
}

interface InsuranceOverviewProps {
  type: 'property' | 'vehicle' | 'asset';
  data: InsuranceData[];
}

interface InsuranceDetailsModalProps {
  item: InsuranceData;
  type: 'property' | 'vehicle' | 'asset';
  onClose: () => void;
  onUpdate: (id: number, updatedData: Partial<InsuranceData>) => void;
  onDelete: (id: number) => void;
}

function InsuranceDetailsModal({ item, type, onClose, onUpdate, onDelete }: InsuranceDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<InsuranceData>(item);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleInputChange = (field: keyof InsuranceData, value: string | number | boolean) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving changes:', editedItem);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    onUpdate(item.id!, editedItem);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(item.id!);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {type === 'property' ? editedItem.propertyName :
             type === 'vehicle' ? editedItem.carDetails :
             editedItem.cover}
          </h3>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              {isEditing ? (
                <select
                  value={editedItem.insured.toString()}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('insured', e.target.value === 'true')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="true">Insured</option>
                  <option value="false">Not Insured</option>
                </select>
              ) : (
                <Badge variant={editedItem.insured ? 'success' : 'danger'}>
                  {editedItem.insured ? 'Insured' : 'Not Insured'}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Insurer</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedItem.insurer}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('insurer', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{editedItem.insurer}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedItem.address}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{editedItem.address}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Payment</p>
              {isEditing ? (
                <input
                  type="date"
                  value={editedItem.nextPaymentDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('nextPaymentDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{editedItem.nextPaymentDate}</p>
              )}
            </div>
            {type === 'vehicle' && editedItem.responsiblePerson && (
              <div>
                <p className="text-sm text-gray-500">Responsible Person</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItem.responsiblePerson}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('responsiblePerson', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="font-medium">{editedItem.responsiblePerson}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Termly Premium</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedItem.termlyPremium}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('termlyPremium', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{formatCurrency(editedItem.termlyPremium)}</p>
              )}
            </div>
            {type === 'vehicle' && editedItem.monthlyPayment && (
              <div>
                <p className="text-sm text-gray-500">Monthly Payment</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedItem.monthlyPayment}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('monthlyPayment', parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="font-medium">{formatCurrency(editedItem.monthlyPayment)}</p>
                )}
              </div>
            )}
            {type === 'vehicle' && editedItem.yearlyPremium && (
              <div>
                <p className="text-sm text-gray-500">Yearly Premium</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedItem.yearlyPremium}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('yearlyPremium', parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="font-medium">{formatCurrency(editedItem.yearlyPremium)}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Amount Insured</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedItem.amountInsured}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('amountInsured', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{formatCurrency(editedItem.amountInsured)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsuranceOverview({ type, data }: InsuranceOverviewProps) {
  const [selectedItem, setSelectedItem] = useState<InsuranceData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { addInsurance, updateInsurance, deleteInsurance } = useInsuranceData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  };

  const getTitle = () => {
    switch (type) {
      case 'property':
        return 'Property Insurance';
      case 'vehicle':
        return 'Vehicle Insurance';
      case 'asset':
        return 'Asset Cover';
      default:
        return 'Insurance Overview';
    }
  };

  const getTableHeaders = () => {
    const baseHeaders = [
      { key: 'name', label: type === 'property' ? 'Property' : type === 'vehicle' ? 'Vehicle' : 'Cover' },
      { key: 'address', label: 'Address' },
      { key: 'insurer', label: 'Insurer' },
      { key: 'nextPayment', label: 'Next Payment' },
      { key: 'premium', label: 'Premium' },
      { key: 'amount', label: 'Amount Insured' },
      { key: 'actions', label: 'Actions' }
    ];

    if (type === 'vehicle') {
      baseHeaders.splice(2, 0, { key: 'responsiblePerson', label: 'Responsible Person' });
    }

    return baseHeaders;
  };

  const handleSaveInsurance = async (insuranceData: Omit<InsuranceData, 'id'>) => {
    try {
      await addInsurance(insuranceData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving insurance:', error);
      // TODO: Show error message to user
    }
  };

  const handleUpdateInsurance = async (id: number, updatedData: Partial<InsuranceData>) => {
    try {
      await updateInsurance(id, updatedData);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating insurance:', error);
      // TODO: Show error message to user
    }
  };

  const handleDeleteInsurance = async (id: number) => {
    try {
      await deleteInsurance(id, type);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting insurance:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <Button
          variant="primary"
          onClick={() => setIsFormOpen(true)}
        >
          Add Insurance
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No insurance records found.</p>
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {getTableHeaders().map((header) => (
                      <th
                        key={header.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id || item.propertyRef} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {type === 'property' ? item.propertyName :
                         type === 'vehicle' ? item.carDetails :
                         item.cover}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.address}
                      </td>
                      {type === 'vehicle' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.responsiblePerson}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant="primary">{item.insurer}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.nextPaymentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.termlyPremium)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.amountInsured)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedItem && (
        <InsuranceDetailsModal
          item={selectedItem}
          type={type}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdateInsurance}
          onDelete={handleDeleteInsurance}
        />
      )}

      {isFormOpen && (
        <InsuranceForm
          type={type}
          onSave={handleSaveInsurance}
          onCancel={() => setIsFormOpen(false)}
          title={`Add New ${getTitle()}`}
        />
      )}
    </div>
  );
}