import { useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import type { MarketData } from "../types";
import { extractHousingTypeBreakdown } from "../../api/rentcast";

// Define the required props for the Pie Chart
interface PieChartProps {
  // Accepts one market's data
  market: MarketData;
}

// Define the colors for the four property types for visual consistency
const PROPERTY_TYPE_COLORS: Record<string, string> = {
  Apartment: "#2563eb", // Blue
  Condo: "#16a34a", // Green
  "Single Family": "#f59e0b", // Yellow/Orange
  Townhouse: "#ef4444", // Red
};

export function PieChart({ market }: PieChartProps) {
  // Use useMemo to prepare the data structure required by Nivo
  const chartData = useMemo(() => {
    // 1. Get the structured breakdown using the utility function
    const breakdown = extractHousingTypeBreakdown(market);

    // 2. Filter out types with zero listings and map to Nivo's { id, value, label } format
    return breakdown
      .filter((d) => d.totalListings > 0)
      .map((d) => ({
        id: d.type,
        label: d.type,
        // The value represents the proportion of total listings
        value: d.totalListings,
        // Add a color for Nivo's styling
        color: PROPERTY_TYPE_COLORS[d.type] || "#cccccc",
      }));
  }, [market]);

  // If no data is available after filtering, show a message
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 h-[300px] flex items-center justify-center text-gray-500">
        No listing data for {market.zip}.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 h-[300px] border border-gray-100">
      <h3 className="text-md font-bold text-gray-700 mb-2">
        Housing Mix in ZIP {market.zip}
      </h3>
      <div className="h-[250px]">
        <ResponsivePie
          data={chartData}
          margin={{ top: 10, right: 80, bottom: 10, left: 80 }}
          innerRadius={0.6} // Doughnut style
          padAngle={1}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          // Use the custom colors defined above
          colors={{ datum: "data.color" }}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          enableArcLinkLabels={false} // Disable lines for clean look
          arcLabelsTextColor="#ffffff"
          // Custom tooltip to show value and percentage
          tooltip={({ datum }) => (
            <div className="px-2 py-1 bg-white rounded shadow text-sm text-gray-800 border border-gray-200">
              <strong>{datum.id}:</strong> {datum.value.toLocaleString()}{" "}
              Listings (
              {(
                (datum.value / chartData.reduce((sum, d) => sum + d.value, 0)) *
                100
              ).toFixed(1)}
              %)
            </div>
          )}
          // Custom Legend for type and percentage
        />
      </div>
    </div>
  );
}
