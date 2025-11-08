import type {
  MarketData,
  HistoricalPoint,
  Metrics,
} from "../components/types";
import MOCK_DATA from "./marketMockData.json";

export async function fetchStatsForZip(zip: string): Promise<MarketData | null> {
  const mockData = MOCK_DATA as MarketData[];
  const result = mockData.find(m => m.zip === zip) ?? null;

  await new Promise(resolve => setTimeout(resolve, 500));

  if (result && import.meta.env.DEV) {
    console.log(`rentcast using MOCK data for ${zip}`);
  } else if (import.meta.env.DEV) {
    console.warn(`rentcast MOCK data not found for ${zip}`);
  }

  return result;
}

export async function fetchStatsForZips(zips: string[]): Promise<MarketData[]> {
  const mockData = MOCK_DATA as MarketData[];
  
  const results = await Promise.all(
    zips.map(async (z) => {
      await new Promise(resolve => setTimeout(resolve, 50)); 
      return mockData.find(m => m.zip === z) ?? null;
    })
  );
  return results.filter((r): r is MarketData => r !== null);
}

export function extractHousingTypeBreakdown(
  market: MarketData,
  types = ["Apartment", "Condo", "Single Family", "Townhouse"]
): { type: string; averageRent: number; medianRent: number; totalListings: number }[] {
  const byType = market.dataByPropertyType ?? [];
  return types.map((t) => {
    const found = byType.find((x) => (x.propertyType ?? "").toLowerCase() === t.toLowerCase());
    return {
      type: t,
      averageRent: found?.averageRent ?? 0,
      medianRent: found?.medianRent ?? 0,
      totalListings: found?.totalListings ?? 0,
    };
  });
}

export function extractBedroomBreakdown(
  market: MarketData,
  bedrooms = [1, 2, 3]
): { bedrooms: number; averageRent: number; medianRent: number; totalListings: number }[] {
  const byBeds = market.dataByBedrooms ?? [];
  return bedrooms.map((b) => {
    const found = byBeds.find((x) => Number(x.bedrooms) === b);
    return {
      bedrooms: b,
      averageRent: found?.averageRent ?? 0,
      medianRent: found?.medianRent ?? 0,
      totalListings: found?.totalListings ?? 0,
    };
  });
}

export function extractHistoricalMonths(
  market: MarketData,
  months = ["2024-06", "2024-07", "2024-08"]
): HistoricalPoint[] {
console.log('Months: ', months)
  return market.historical; 
}

export function buildSeriesForMetric(
  markets: MarketData[],
  metricKey: keyof Metrics = "averageRent"
): { zip: string; value: number }[] {
  return markets.map((m) => ({ zip: m.zip, value: Number((m.metrics as any)[metricKey] ?? 0) }));
}