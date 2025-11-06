import { useMemo } from "react";
//import { ResponsiveLine } from "@nivo/line";
import type { MarketData, HistoricalPoint } from "../types";
import { extractHistoricalMonths } from "../../api/rentcast";

type HistoricalMetric = "rent" | "daysOnMarket" | "listings";

interface HistoricalLineChartProps {
  market: MarketData;
  metricView: HistoricalMetric;
}

// full metric configuration dictionary
const METRIC_CONFIG = {
  rent: {
    title: "Rent Prices",
    keys: ["averageRent", "medianRent"] as (keyof HistoricalPoint)[],
    legend: "Rent Price",
    unit: "$/Mo",
    colors: ["#2563eb", "#16a34a"],
  },
  daysOnMarket: {
    title: "Days on Market",
    keys: [
      "averageDaysOnMarket",
      "medianDaysOnMarket",
    ] as (keyof HistoricalPoint)[],
    legend: "Days",
    unit: "",
    colors: ["#f59e0b", "#9333ea"],
  },
  listings: {
    title: "Total Listings",
    keys: ["totalListings"] as (keyof HistoricalPoint)[],
    legend: "Count",
    unit: "",
    colors: ["#ef4444"],
  },
};

function historyToNivoData(
  data: HistoricalPoint[],
  keys: (keyof HistoricalPoint)[],
  _zip: string
) {
  return keys.map((key) => ({
    id: String(key),
    data: data
      .map((d) => ({
        x: d.month,
        y: (d[key] as number | null) ?? null,
      }))
      .filter((d) => d.y !== null),
  }));
}

export function HistoricalLineChart({
  market,
  metricView,
}: HistoricalLineChartProps) {
  const config = METRIC_CONFIG[metricView];

  const historicalData = useMemo(() => {
    return extractHistoricalMonths(market);
  }, [market]);

  const chartData = useMemo(() => {
    return historyToNivoData(historicalData, config.keys, market.zip);
  }, [historicalData, config.keys, market.zip]);

  return (
    <div className="h-96 w-full p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {config.title} for ZIP {market.zip}
      </h3>
      <div className="text-sm text-gray-500"></div>
    </div>
  );
}
