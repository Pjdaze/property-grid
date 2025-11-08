//import type {
//  RentcastMarketsResponse,
//  MarketData,
//  HistoricalPoint,
//  Metrics,
//  RentalDataByPropertyType,
//  RentalDataByBedrooms,
//} from "../components/types";
//
//const BASE = "/api/rentcast"; // dev proxy
//const API_KEY = (import.meta.env.VITE_RENTCAST_KEY as string | undefined) ?? undefined;
//
//async function safeJson<T>(res: Response): Promise<T> {
//  const text = await res.text();
//  if (!res.ok) {
//    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
//  }
//  try {
//    return JSON.parse(text) as T;
//  } catch (err) {
//    throw new Error(`Invalid JSON response: ${String(err)}`);
//  }
//}
//
//function toMetrics(src: Partial<RentcastMarketsResponse["rentalData"]> | undefined): Metrics {
//  const s = src ?? {};
//  return {
//    averageRent: s.averageRent ?? 0,
//    medianRent: s.medianRent ?? 0,
//    minRent: s.minRent ?? 0,
//    maxRent: s.maxRent ?? 0,
//    averageSqft: s.averageSquareFootage ?? null,
//    medianSqft: s.medianSquareFootage ?? null,
//    averageDaysOnMarket: s.averageDaysOnMarket ?? null,
//    medianDaysOnMarket: s.medianDaysOnMarket ?? null,
//    totalListings: s.totalListings ?? 0,
//  };
//}
//
//function historyToArray(h?: Record<string, any>): HistoricalPoint[] {
//  if (!h) return [];
//  return Object.entries(h).map(([month, entry]) => ({
//    month,
//    averageRent: entry?.averageRent ?? null,
//    medianRent: entry?.medianRent ?? null,
//    averageDaysOnMarket: entry?.averageDaysOnMarket ?? null,
//    medianDaysOnMarket: entry?.medianDaysOnMarket ?? null,
//    totalListings: entry?.totalListings ?? null,
//  }));
//}
//
//
//function normalizeItem(item: RentcastMarketsResponse, fallbackZip: string): MarketData {
//  const rental = item.rentalData ?? {};
//  return {
//    zip: (item.id ?? item.zipCode ?? fallbackZip) as string,
//    market: (item.zipCode ?? undefined) as string | undefined,
//    metrics: toMetrics(rental),
//    dataByPropertyType: (rental.dataByPropertyType as RentalDataByPropertyType[] | undefined) ?? undefined,
//    dataByBedrooms: (rental.dataByBedrooms as RentalDataByBedrooms[] | undefined) ?? undefined,
//    historical: historyToArray(rental.history as Record<string, any> | undefined),
//  };
//}
//
//const CACHE_PREFIX = "rentcast_cache_";
//// for 7 day cache.. :(
//const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
//
//function getCached<T>(key: string): T | null {
//  try {
//    const raw = localStorage.getItem(CACHE_PREFIX + key);
//    if (!raw) return null;
//
//    const cached = JSON.parse(raw);
//    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
//      localStorage.removeItem(CACHE_PREFIX + key);
//      return null;
//    }
//    return cached.data as T;
//  } catch {
//    return null;
//  }
//}
//
//function setCached<T>(key: string, data: T): void {
//  try {
//    const wrapped = { timestamp: Date.now(), data };
//    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(wrapped));
//  } catch {
//
//  }
//}
//
//
//export async function fetchStatsForZip(zip: string): Promise<MarketData | null> {
//  // Check cache 
//  const cached = getCached<MarketData>(zip);
//  if (cached) {
//    if (import.meta.env.DEV) console.log(`[rentcast] using cached data for ${zip}`);
//    return cached;
//  }
//
//  const url = `${BASE}/markets?zipCode=${encodeURIComponent(zip)}`;
//  const headers: Record<string, string> = {
//    Accept: "application/json",
//    "Content-Type": "application/json",
//  };
//  if (API_KEY) headers["X-Api-Key"] = API_KEY;
//
//  const res = await fetch(url, { method: "GET", headers });
//  const raw = await safeJson<any>(res);
//
//  if (import.meta.env.DEV) {
//    console.debug("[rentcast] raw response for", zip, raw);
//  }
//
//  const items: RentcastMarketsResponse[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
//  if (!items.length) {
//    if (import.meta.env.DEV) console.warn("[rentcast] no items for zip", zip);
//    return null;
//  }
//
//  const normalized = normalizeItem(items[0], zip);
//
//// save to cache
//  setCached(zip, normalized);
//
//  return normalized;
//}
//
///** Fetch multiple zips in parallel with caching */
//export async function fetchStatsForZips(zips: string[]): Promise<MarketData[]> {
//  const results = await Promise.all(
//    zips.map(async (z) => {
//      try {
//        return await fetchStatsForZip(z);
//      } catch (err) {
//        if (import.meta.env.DEV) console.error("[rentcast] fetch error", z, err);
//        return null;
//      }
//    })
//  );
//  return results.filter((r): r is MarketData => r !== null);
//}
//
//export function extractHousingTypeBreakdown(
//  market: MarketData,
//  types = ["Apartment", "Condo", "Single Family", "Townhouse"]
//): { type: string; averageRent: number; medianRent: number; totalListings: number }[] {
//  const byType = market.dataByPropertyType ?? [];
//  return types.map((t) => {
//    const found = byType.find((x) => (x.propertyType ?? "").toLowerCase() === t.toLowerCase());
//    return {
//      type: t,
//      averageRent: found?.averageRent ?? 0,
//      medianRent: found?.medianRent ?? 0,
//      totalListings: found?.totalListings ?? 0,
//    };
//  });
//}
//
//// this here returns breakdown for requested bedroom counts (1,2,3) 
//export function extractBedroomBreakdown(
//  market: MarketData,
//  bedrooms = [1, 2, 3]
//): { bedrooms: number; averageRent: number; medianRent: number; totalListings: number }[] {
//  const byBeds = market.dataByBedrooms ?? [];
//  return bedrooms.map((b) => {
//    const found = byBeds.find((x) => Number(x.bedrooms) === b);
//    return {
//      bedrooms: b,
//      averageRent: found?.averageRent ?? 0,
//      medianRent: found?.medianRent ?? 0,
//      totalListings: found?.totalListings ?? 0,
//    };
//  });
//}
//
///** this returns historical points for specific months in chronological order */
//export function extractHistoricalMonths(
//  market: MarketData,
//  months = ["2025-01", "2025-02", "2025-03"]
//): HistoricalPoint[] {
//  const map = new Map(market.historical.map((h) => [h.month, h]));
//  return months.map((m) => map.get(m) ?? { month: m });
//}
//
//// Convenience: build series data for grouped bar chart across zips for given metric key 
//export function buildSeriesForMetric(
//  markets: MarketData[],
//  metricKey: keyof Metrics = "averageRent"
//): { zip: string; value: number }[] {
//  return markets.map((m) => ({ zip: m.zip, value: Number((m.metrics as any)[metricKey] ?? 0) }));
//}