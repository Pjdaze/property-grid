import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchStatsForZips } from "../../api/rentcastMock";
import type { MarketData } from "../types";
import { VerticalBarChart } from "../charts/VerticalBarChart";
import { HistoricalLineChart } from "../charts/HorizontalLineChart";
import { PieChart } from "../charts/PieChart";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";
// hardcoded set to avoid massive data load
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
const MAX_COMPARISON_ZIPS = 8;

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
    <div className="space-y-12 mx-auto w-[95%] py-8 font-sans text-gray-800">
      {/* ZIP Selector */}
      <section className="p-8 rounded-2xl bg-white shadow-md border border-gray-100">
        <h2 className="text-2xl font-semibold mb-6 tracking-tight">
          Compare ZIP Codes
        </h2>

        <div className="relative max-w-lg mb-6">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="search"
            placeholder={
              selectedZips.length >= MAX_COMPARISON_ZIPS
                ? "Max zips selected"
                : "Search ZIP (e.g., 32804)"
            }
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm"
            inputMode="numeric"
            pattern="\d*"
            maxLength={5}
            disabled={selectedZips.length >= MAX_COMPARISON_ZIPS}
          />
          {searchQuery &&
            filteredSuggestions.length > 0 &&
            selectedZips.length < MAX_COMPARISON_ZIPS && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-sm mt-2 max-h-48 overflow-y-auto text-sm">
                {filteredSuggestions.map((zip) => (
                  <li
                    key={zip}
                    onClick={() => handleSuggestionClick(zip)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-50 transition"
                  >
                    {zip}
                  </li>
                ))}
              </ul>
            )}
          {searchQuery &&
            filteredSuggestions.length === 0 &&
            selectedZips.length < MAX_COMPARISON_ZIPS && (
              <div className="px-4 py-2 text-gray-400 text-sm">
                No ZIPs matching "{searchQuery}" found.
              </div>
            )}
        </div>

        {/* Selected ZIP Tags */}
        <div className="flex flex-wrap gap-3">
          {selectedZips.map((zip) => (
            <button
              key={zip}
              onClick={() => handleRemoveZip(zip)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedZips.length <= 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              disabled={selectedZips.length <= 1}
            >
              {zip} <XMarkIcon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </section>

      {/* Comparison Charts */}
      {comparisonData.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition">
            <VerticalBarChart data={comparisonData} loading={false} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold mb-4">
              Housing Type Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonData.map((market) => (
                <div
                  key={market.zip}
                  className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <PieChart market={market} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Historical Line Charts */}
      {comparisonData.length > 0 ? (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            Historical Market Trends
          </h2>
          {comparisonData.map((market) => (
            <div
              key={market.zip}
              className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <h3 className="text-lg font-medium mb-4">
                Trends for ZIP {market.zip}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="p-6 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
          Please select at least one ZIP code to view the comparison data.
        </div>
      )}
    </div>
  );
}
