import React from 'react';
import { PropertyDocument } from '../../types/property';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type PropertyDocumentsProps = {
  documents: PropertyDocument[];
  onAddDocument?: () => void;
  onViewDocument?: (document: PropertyDocument) => void;
};

export function PropertyDocuments({ documents, onAddDocument, onViewDocument }: PropertyDocumentsProps) {
  const getStatusColor = (status: PropertyDocument['status']) => {
    const colors = {
      Valid: 'success',
      Pending: 'warning',
      Expired: 'danger'
    };
    return colors[status];
  };

  const getDocumentIcon = (type: PropertyDocument['type']) => {
    const icons = {
      'Deed': 'bi bi-file-earmark-text',
      'Confirmation': 'bi bi-file-check',
      'Payment Receipt': 'bi bi-receipt',
      'Allocation Letter': 'bi bi-envelope',
      'Contract of Sale': 'bi bi-file-earmark-ruled'
    };
    return icons[type];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Property Documents</h3>
          {onAddDocument && (
            <Button
              variant="outline"
              onClick={onAddDocument}
              className="text-sm"
            >
              <i className="bi bi-plus-lg mr-2"></i>
              Add Document
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No documents available</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => onViewDocument?.(doc)}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-gray-600 text-xl">
                    <i className={getDocumentIcon(doc.type)}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      {doc.location} • Last updated: {doc.lastUpdated}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                  <button className="text-gray-400 hover:text-gray-600">
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}