import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface PropertyTypeChartProps {
  distribution: Record<string, number>;
}

export function PropertyTypeChart({ distribution }: PropertyTypeChartProps) {
  const colors = {
    House: 'bg-blue-500',
    Land: 'bg-green-500',
    Flat: 'bg-yellow-500', 
    Cottage: 'bg-purple-500',
    Cluster: 'bg-pink-500'
  } as Record<string, string>;

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Property Types</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(distribution).map(([type, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const color = colors[type] || 'bg-gray-500';
            
            return (
              <div key={type} className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
                    <span className="text-sm text-gray-600">{type}</span>
                  </div>
                  <Badge variant={type === 'House' ? 'primary' : 'secondary'}>
                    {count} ({percentage.toFixed(0)}%)
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}