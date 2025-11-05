import type {
  RentcastMarketsResponse,
  MarketData,
  HistoricalPoint,
  Metrics,
  RentalDataByPropertyType,
  RentalDataByBedrooms,
} from "../components/types";


const BASE = "/api/rentcast";
const API_KEY = (import.meta.env.VITE_RENTCAST_KEY as string | undefined) ?? undefined;



// Simplified metric normalization (directly translates API response to Metrics)
function toMetrics(src: Partial<RentcastMarketsResponse["rentalData"]> | undefined): Metrics {
  const s = src ?? {};
  return {
    averageRent: s.averageRent ?? 0,
    medianRent: s.medianRent ?? 0,
    minRent: s.minRent ?? 0,
    maxRent: s.maxRent ?? 0,
    averageSqft: s.averageSquareFootage ?? null,
    medianSqft: s.medianSquareFootage ?? null,
    averageDaysOnMarket: s.averageDaysOnMarket ?? null,
    medianDaysOnMarket: s.medianDaysOnMarket ?? null,
    totalListings: s.totalListings ?? 0,
  };
}

// This is to tunr historical data object into an array
function historyToArray(h?: Record<string, any>): HistoricalPoint[] {
  if (!h) return [];
  return Object.entries(h).map(([month, entry]) => ({
    month,
    averageRent: entry?.averageRent ?? null,
    medianRent: entry?.medianRent ?? null,
    averageDaysOnMarket: entry?.averageDaysOnMarket ?? null,
    medianDaysOnMarket: entry?.medianDaysOnMarket ?? null,
    totalListings: entry?.totalListings ?? null,
  }));
}


// Core function to normalize upstream item into MarketData.

function normalizeItem(item: RentcastMarketsResponse, fallbackZip: string): MarketData {
  const rental = item.rentalData ?? {};
  return {
    zip: (item.id ?? item.zipCode ?? fallbackZip) as string,
    market: (item.zipCode ?? undefined) as string | undefined,
    metrics: toMetrics(rental),
    dataByPropertyType: (rental.dataByPropertyType as RentalDataByPropertyType[] | undefined) ?? undefined,
    dataByBedrooms: (rental.dataByBedrooms as RentalDataByBedrooms[] | undefined) ?? undefined,
    historical: historyToArray(rental.history as Record<string, any> | undefined),
  };
}



export async function fetchStatsForZip(zip: string): Promise<MarketData | null> {
  const url = `${BASE}/markets?zipCode=${encodeURIComponent(zip)}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["X-Api-Key"] = API_KEY;

  const res = await fetch(url, { method: "GET", headers });

  // Basic check, not robust 'safeJson' yet
  if (!res.ok) {
    console.error(`API Error for ${zip}: HTTP ${res.status}`);
    return null; 
  }

  // Simple JSON parsing
  const raw: any = await res.json().catch(err => {
    console.error(`JSON Parse Error for ${zip}:`, err);
    return null;
  });

  if (!raw || (Array.isArray(raw) && raw.length === 0)) {
    return null;
  }

  const items: RentcastMarketsResponse[] = Array.isArray(raw) ? raw : [raw];
  
  // Return normalized data
  return normalizeItem(items[0], zip);
}


