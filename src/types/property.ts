export interface PropertyDocument {
  id: string;
  name: string;
  type: 'Deed' | 'Confirmation' | 'Payment Receipt' | 'Allocation Letter' | 'Contract of Sale';
  location: string;
  dateAdded: string;
  lastUpdated: string;
  status: 'Valid' | 'Pending' | 'Expired';
  notes?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  propertyType: 'House' | 'Land' | 'Flat' | 'Cottage' | 'Cluster';
  purchaseDate: string;
  ownedEntity: string;
  purchasePrice: number;
  purchaseFees: number;
  totalPurchaseAmount: number;
  estimatedCurrentValue: number;
  investmentRequired: number;
  usageAfterInvestment: string;
  potentialIncome: number;
  documents: PropertyDocument[];
}

export type PropertyFilterKey = keyof Omit<Property, 'id' | 'documents'>;