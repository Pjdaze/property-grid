// Rentcast types rental-focused subset 
export type HousingType = "Apartment" | "Condo" | "Single Family" | "Townhouse" | string;
export type BedroomCount = number;

// Fields needed for rental market data
export interface RentalStatsFields {
  averageRent?: number | null;
  medianRent?: number | null;
  minRent?: number | null;
  maxRent?: number | null;
  averageSquareFootage?: number | null;
  medianSquareFootage?: number | null;
  averageDaysOnMarket?: number | null;
  medianDaysOnMarket?: number | null;
  totalListings?: number | null;
  
}

export interface RentalDataByPropertyType {
  propertyType: HousingType;

  averageRent?: number | null;
  medianRent?: number | null;
  minRent?: number | null;
  maxRent?: number | null;
  averageSquareFootage?: number | null;
  medianSquareFootage?: number | null;
  averageDaysOnMarket?: number | null;
  medianDaysOnMarket?: number | null;
  totalListings?: number | null;
}

export interface RentalDataByBedrooms extends RentalStatsFields {
  bedrooms: number;
}

export interface RentalHistoryEntry extends RentalStatsFields {
  date?: string; 
}

export interface RentcastMarketsResponse {
  id: string;
  zipCode?: string;
  rentalData?: {
    lastUpdatedDate?: string;

    averageRent?: number | null;
    medianRent?: number | null;
    minRent?: number | null;
    maxRent?: number | null;
    averageSquareFootage?: number | null;
    medianSquareFootage?: number | null;
    averageDaysOnMarket?: number | null;
    medianDaysOnMarket?: number | null;
    totalListings?: number | null;
    dataByPropertyType?: RentalDataByPropertyType[];
    dataByBedrooms?: RentalDataByBedrooms[];
    history?: Record<string, RentalHistoryEntry>; 
  };

}

// Normalized types for charts and UI
export interface Metrics {
  averageRent: number;
  medianRent: number;
  minRent: number;
  maxRent: number;
  averageSqft?: number | null;
  medianSqft?: number | null;
  averageDaysOnMarket?: number | null;
  medianDaysOnMarket?: number | null;
  totalListings: number;
}

export interface HistoricalPoint {
  month: string; 
  averageRent?: number | null;
  medianRent?: number | null;
  averageDaysOnMarket?: number | null;
  medianDaysOnMarket?: number | null;
  totalListings?: number | null;
}

export interface MarketData {
  zip: string;
  market?: string;
  metrics: Metrics;
  dataByPropertyType?: RentalDataByPropertyType[];
  dataByBedrooms?: RentalDataByBedrooms[];
  historical: HistoricalPoint[];
}
