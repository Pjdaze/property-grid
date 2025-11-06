import type { MarketData } from "../types";

type HistoricalMetric = "rent" | "daysOnMarket" | "listings";

interface HistoricalLineChartProps {
  market: MarketData;
  metricView: HistoricalMetric;
}

// Temporary data structure placeholder for development
const METRIC_CONFIG_PLACEHOLDER = {
  rent: { title: "Rent Prices" },
  daysOnMarket: { title: "Days on Market" },
  listings: { title: "Total Listings" },
};

export function HistoricalLineChart({
  market,
  metricView,
}: HistoricalLineChartProps) {
  //  temp configuration until data is integrated
  const config = METRIC_CONFIG_PLACEHOLDER[metricView];

  // Placeholder for chart rendering
  return (
    <div className="h-96 w-full p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {config.title} for ZIP {market.zip}
      </h3>
      <div className="text-sm text-gray-500">Chart structure placeholder.</div>
    </div>
  );
}
