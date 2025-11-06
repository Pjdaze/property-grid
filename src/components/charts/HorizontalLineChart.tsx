import { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
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

  // Data processing hooks from Commit B
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

      <div className="h-[calc(100%-40px)] w-full">
        <ResponsiveLine
          data={chartData}
          // UPDATED: Increased margin bottom and left for axes
          margin={{ top: 10, right: 10, bottom: 60, left: 70 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="natural"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            // UPDATED: Added a legend label for the axis
            legend: "Month",
            // UPDATED: Adjusted offset for better label positioning
            legendOffset: 45,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: config.legend,
            // UPDATED: Adjusted offset to prevent number/label overlap
            legendOffset: -60,
            legendPosition: "middle",
          }}
          enableGridX={false}
          colors={config.colors}
          // UPDATED: Increased point size and border for clarity
          pointSize={8}
          pointBorderWidth={3}
          pointBorderColor={{ from: "serieColor" }}
          useMesh={true}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              justify: false,
              translateX: 0,
              // UPDATED: Move legend down slightly for better positioning
              translateY: 20,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
            },
          ]}
        />
      </div>
    </div>
  );
}
