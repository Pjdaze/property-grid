import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchStatsForZips } from "../../api/rentcast";
import type { MarketData } from "../types";
import { VerticalBarChart } from "../charts/VerticalBarChart";
import { HistoricalLineChart } from "../charts/HorizontalLineChart";
import { PieChart } from "../charts/PieChart";

const ALL_AVAILABLE_ZIPS = [
  "32789",
  "32792",
  "32807",
  "32801",
  "32803",
  "32804",
  "32806",
  "32808",
  "32809",
  "32810",
  "32812",
  "32814",
];
const MAX_COMPARISON_ZIPS = 3;

export function AdminDashboard() {
  const [allMarkets, setAllMarkets] = useState<MarketData[] | null>(null);
  const [selectedZips, setSelectedZips] = useState<string[]>(
    ALL_AVAILABLE_ZIPS.slice(0, MAX_COMPARISON_ZIPS)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const comparisonData = useMemo(() => {
    if (!allMarkets) return [];
    return allMarkets.filter((market) => selectedZips.includes(market.zip));
  }, [allMarkets, selectedZips]);

  const filteredSuggestions = useMemo(() => {
    if (!allMarkets) return [];

    const availableZipsWithData = allMarkets.map((m) => m.zip);

    const query = searchQuery.trim();
    if (query === "") {
      return [];
    }

    return availableZipsWithData
      .filter((zip) => zip.includes(query) && !selectedZips.includes(zip))
      .slice(0, 5); // Limit suggestions to 5
  }, [allMarkets, searchQuery, selectedZips]);

  const handleZipToggle = useCallback((zip: string) => {
    setSelectedZips((prevZips) => {
      if (prevZips.includes(zip)) {
        if (prevZips.length <= 1) return prevZips;
        return prevZips.filter((z) => z !== zip);
      } else if (prevZips.length < MAX_COMPARISON_ZIPS) {
        return [...prevZips, zip];
      }
      return prevZips;
    });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.trim());
  };

  const handleSuggestionClick = (zip: string) => {
    handleZipToggle(zip);
    setSearchQuery("");
  };

  const handleRemoveZip = (zip: string) => {
    handleZipToggle(zip);
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchStatsForZips(ALL_AVAILABLE_ZIPS);

        if (!res || res.length === 0) {
          setError("No data received from API for any ZIP codes");
        } else {
          setAllMarkets(res);
          // Ensure initial selected zips are those that actually returned data
          setSelectedZips((currentZips) =>
            currentZips.filter((zip) => res.some((m) => m.zip === zip))
          );
        }
      } catch (err: any) {
        console.error("[Dashboard] Fetch error:", err);
        setError(err?.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) return <div className="p-6">Loading all market data...</div>;
  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
        <div className="mt-2 text-sm text-gray-600">
          An error has occurred. Please try again later.
        </div>
      </div>
    );
  if (!allMarkets || allMarkets.length === 0)
    return <div className="p-6">No data available</div>;

  return (
    <div className="space-y-8 mx-auto w-[95%] rounded bg-[#e5ebf0] rounded-lg">
      <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
        <section className="bg-[#f9f9f9] p-6 rounded-2xl shadow-lg border border-gray-200 lg:col-span-full">
          <h2 className="text-xl font-bold mb-6 text-gray-700">
            Select up to 3 ZIP Codes to Compare
          </h2>

          <div className="relative mb-6">
            {" "}
            {/* Increased bottom margin for spacing */}
            <div className="relative">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder={
                  selectedZips.length >= MAX_COMPARISON_ZIPS
                    ? "Max zips selected"
                    : "Type ZIP code (e.g., 32804)"
                }
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-1/4 min-w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                inputMode="numeric"
                pattern="\d*"
                maxLength={5}
                disabled={selectedZips.length >= MAX_COMPARISON_ZIPS}
              />
            </div>
            {/* Suggestions Dropdown (No style changes needed here) */}
            {searchQuery.length > 0 &&
              filteredSuggestions.length > 0 &&
              selectedZips.length < MAX_COMPARISON_ZIPS && (
                <ul className="absolute z-10 w-full bg-[#f9f9f9] border border-gray-300 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                  {filteredSuggestions.map((zip) => (
                    <li
                      key={zip}
                      onClick={() => handleSuggestionClick(zip)}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-800"
                    >
                      {zip}
                    </li>
                  ))}
                </ul>
              )}
            {searchQuery.length > 0 &&
              filteredSuggestions.length === 0 &&
              selectedZips.length < MAX_COMPARISON_ZIPS && (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No other ZIPs matching "{searchQuery}" available.
                </div>
              )}
          </div>

          {/* Selected ZIP Tags */}
          <div className="flex flex-wrap  gap-3 p-2 border border-transparent">
            {selectedZips.map((zip) => (
              <button
                key={zip}
                onClick={() => handleRemoveZip(zip)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 
                  bg-blue-600 text-white shadow-md flex items-center 
                  ${
                    selectedZips.length <= 1
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }
                `}
                // to prevent removing the last one
                disabled={selectedZips.length <= 1}
              >
                {zip}

                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
          </div>
        </section>

        {/* Conditional Chart Rendering */}
        {comparisonData.length > 0 && (
          <>
            <section className="lg:col-span-1 bg-[#f9f9f9] p-6 rounded-2xl shadow-lg border border-gray-200">
              <VerticalBarChart data={comparisonData} loading={false} />
            </section>

            {/* Pie Charts  */}
            <section className="space-y-6 lg:col-span-2">
              {" "}
              <h2 className="text-xl font-bold text-gray-700">
                Housing Type Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f9f9f9] p-6 rounded-2xl shadow-lg border border-gray-200">
                {comparisonData.map((market) => (
                  <PieChart key={market.zip} market={market} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Historical Line Charts */}
      {comparisonData.length > 0 ? (
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-gray-700">
            Historical Market Trends (Q1 2025)
          </h2>

          {comparisonData.map((market) => (
            <div
              key={market.zip}
              className="bg-[#f9f9f9] p-6 rounded-2xl shadow-lg border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {" "}
                Trends for ZIP {market.zip}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <HistoricalLineChart market={market} metricView="rent" />
                <HistoricalLineChart
                  market={market}
                  metricView="daysOnMarket"
                />
                <HistoricalLineChart market={market} metricView="listings" />
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="p-6 text-center text-gray-600 bg-[#f9f9f9] rounded-xl shadow-md">
          Please select at least one ZIP code to view the comparison data.
        </div>
      )}
    </div>
  );
}
