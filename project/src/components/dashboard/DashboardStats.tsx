import React from 'react';
import { TrendingUp, Home, DollarSign, Building } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

export interface DashboardStatsProps {
  propertyCount: number;
  totalValue: number;
  totalInvestment: number;
  propertyTypeDistribution: Record<string, number>;
}

export function DashboardStats({ 
  propertyCount, 
  totalValue, 
  totalInvestment,
  propertyTypeDistribution 
}: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const roi = totalInvestment > 0 
    ? ((totalValue - totalInvestment) / totalInvestment * 100).toFixed(1) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Home className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <h3 className="text-2xl font-semibold text-gray-900">{propertyCount}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
              <h3 className="text-2xl font-semibold text-gray-900">{formatCurrency(totalValue)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Building className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Investment</p>
              <h3 className="text-2xl font-semibold text-gray-900">{formatCurrency(totalInvestment)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">ROI</p>
              <h3 className="text-2xl font-semibold text-gray-900">{roi}%</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}