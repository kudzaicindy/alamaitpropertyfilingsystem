export interface VehicleInsurance {
  id: string;
  carDetails: string;
  responsiblePerson: string;
  insurer: string;
  nextPaymentDate: string;
  termlyPremium: number;
  amountInsured: number;
}

export interface PropertyInsurance {
  propertyRef: string;
  propertyName: string;
  address: string;
  insurer: string;
  nextPaymentDate: string;
  termlyPremium: number;
  amountInsured: number;
}

export interface AssetInsurance {
  id: string;
  cover: string;
  address: string;
  insurer: string;
  nextPaymentDate: string;
  termlyPremium: number;
  amountInsured: number;
}