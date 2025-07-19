export interface Product {
  id: string;
  name: string;
  description: string;
  type: string; // IPA, Lager, Pilsner, etc.
  category: string; // Artesanal, Premium, Standard
  abv: number; // Alcohol by volume
  ibu: number; // International Bitterness Units
  srm: number; // Standard Reference Method (color)
  isEligibleForTasting: boolean;
  specifications: ProductSpecifications;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProductSpecifications {
  ph: number;
  density: number;
  temperature: {
    min: number;
    max: number;
  };
  storageConditions: {
    temperature: number;
    humidity: number;
    light: 'protected' | 'exposed';
  };
  shelfLife: number; // days
  ingredients: string[];
  allergens: string[];
}

export interface OrderingRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sessionTypes: ('routine' | 'extra')[];
  productOrders: ProductOrder[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProductOrder {
  productId: string;
  order: number;
  isIncluded: boolean;
  notes?: string;
}

export interface OrderingRuleApplication {
  id: string;
  ruleId: string;
  sessionId: string;
  appliedProducts: {
    productId: string;
    finalOrder: number;
    samples: string[]; // Sample IDs that belong to this product
  }[];
  appliedAt: string;
  appliedBy: string;
}