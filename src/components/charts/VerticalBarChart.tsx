import { useState, useMemo } from "react";
import type { MarketData } from "../types";
import { ResponsiveBar } from "@nivo/bar";
import { buildSeriesForMetric } from "../../api/rentcast";

interface VerticalBarChartProps {
  data: MarketData[];
  loading: boolean;
}

type RentMetric = "averageRent" | "medianRent" | "minRent" | "maxRent";

const METRIC_OPTIONS: { key: RentMetric; label: string }[] = [
  { key: "averageRent", label: "Average Rent" },
  { key: "medianRent", label: "Median Rent" },
  { key: "minRent", label: "Minimum Rent" },
  { key: "maxRent", label: "Maximum Rent" },
];

export function VerticalBarChart({ data, loading }: VerticalBarChartProps) {
  const [metric, setMetric] = useState<RentMetric>("medianRent");
  const [open, setOpen] = useState(false);

  const chartData = useMemo(() => {
    if (!data.length) return [];

    return buildSeriesForMetric(data, metric);
  }, [data, metric]);

  const colors: Record<RentMetric, string> = {
    averageRent: "#2563eb",
    medianRent: "#16a34a",
    minRent: "#f59e0b",
    maxRent: "#ef4444",
  };
  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-4 min-w-[400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">M R C</h2>

        {/* Custom Dropdown */}
        <div className="relative inline-block text-left">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex justify-between w-48 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            {METRIC_OPTIONS.find((m) => m.key === metric)?.label}
            <svg
              className="ml-2 h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <ul className="py-1 text-sm text-gray-700">
                {METRIC_OPTIONS.map((opt) => (
                  <li key={opt.key}>
                    <button
                      onClick={() => {
                        setMetric(opt.key);
                        setOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        metric === opt.key ? "bg-gray-100 font-medium" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            Loading data...
          </div>
        ) : (
          <ResponsiveBar
            data={chartData}
            keys={["value"]}
            indexBy="zip"
            margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
            padding={0.4}
            colors={[colors[metric] ?? "#2563eb"]}
            borderRadius={6}
            theme={{
              text: {
                fill: "#374151",
                fontSize: 12,
              },
              tooltip: {
                container: {
                  background: "#fff",
                  color: "#111",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  padding: "6px 10px",
                },
              },
              axis: {
                ticks: {
                  text: { fill: "#4b5563" },
                },
                legend: {
                  text: { fill: "#374151" },
                },
              },
              grid: {
                line: { stroke: "#e5e7eb" },
              },
            }}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              legend: "ZIP Code",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
              legend: "Rent ($)",
              legendOffset: -55,
              legendPosition: "middle",
            }}
            tooltip={({ data }) => (
              <div className="px-2 py-1 bg-white rounded shadow text-sm text-gray-800 border border-gray-200">
                <strong>
                  {data.zip} (
                  {METRIC_OPTIONS.find((m) => m.key === metric)?.label}):
                </strong>{" "}
                ${Number(data.value).toLocaleString()}
              </div>
            )}
            animate={true}
            motionConfig="gentle"
          />
        )}
      </div>
    </div>
  );
}
