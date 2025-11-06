import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchStatsForZips } from "../../api/rentcast";
import type { MarketData } from "../types";
import { VerticalBarChart } from "../charts/VerticalBarChart";

import { PieChart } from "../charts/PieChart";

// All available ZIP codes for the Orlando market.
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

  // Filter the full market data to only include selected ZIPs for chart props
  const comparisonData = useMemo(() => {
    if (!allMarkets) return [];
    return allMarkets.filter((market) => selectedZips.includes(market.zip));
  }, [allMarkets, selectedZips]);

  // Filter the available ZIPs for predictive suggestions
  const filteredSuggestions = useMemo(() => {
    if (!allMarkets) return [];

    // Zips that returned data and are NOT currently selected
    const availableZipsWithData = allMarkets.map((m) => m.zip);

    const query = searchQuery.trim();
    if (query === "") {
      return []; // No suggestions unless the user starts typing
    }

    return availableZipsWithData
      .filter((zip) => zip.includes(query) && !selectedZips.includes(zip))
      .slice(0, 5); // Limit suggestions to 5
  }, [allMarkets, searchQuery, selectedZips]);

  // Handler for adding/removing a zip from selection (used by both search and tag removal)
  const handleZipToggle = useCallback((zip: string) => {
    setSelectedZips((prevZips) => {
      if (prevZips.includes(zip)) {
        // Remove ZIP, but enforce a minimum of one selected
        if (prevZips.length <= 1) return prevZips;
        return prevZips.filter((z) => z !== zip);
      } else if (prevZips.length < MAX_COMPARISON_ZIPS) {
        // Add ZIP if limit is not reached
        return [...prevZips, zip];
      }
      return prevZips;
    });
  }, []);

  // Handler for search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.trim());
  };

  // Handler for selecting a ZIP from the suggestions list
  const handleSuggestionClick = (zip: string) => {
    handleZipToggle(zip);
    setSearchQuery("");
  };

  // Handler for removing a selected tag
  const handleRemoveZip = (zip: string) => {
    handleZipToggle(zip);
  };

  // Effect to load all data (runs only once)
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

  // --- Render Logic (Loading/Error/No Data) ---
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
    <div className="p-6 space-y-8 mx-auto bg-[#e5ebf2] w-full max-w-7xl rounded-2xl shadow-xl">
      <h1 className="text-3xl font-extrabold text-gray-900">
        Orlando Real Estate Market Analysis
      </h1>

      {/* NEW: Wrapper for Top Grid Sections (Selector, Bar Chart, Pie Charts) */}
      <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
        {/* 1. ZIP Code Selector and Search (Predictive Input Focus) */}
        <section className="bg-[#f9f9f9] p-4 rounded-xl shadow-md border border-gray-100 lg:col-span-full">
          <h2 className="text-lg font-bold mb-4 text-gray-700">
            Select ZIP Codes for Comparison (Max {MAX_COMPARISON_ZIPS})
          </h2>

          {/* Search Input and Suggestions Container */}
          <div className="relative mb-4">
            <div className="relative bg-[#f9f9f9]">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                inputMode="numeric"
                pattern="\d*"
                maxLength={5}
                disabled={selectedZips.length >= MAX_COMPARISON_ZIPS}
              />
            </div>

            {/* Suggestions Dropdown */}
            {searchQuery.length > 0 &&
              filteredSuggestions.length > 0 &&
              selectedZips.length < MAX_COMPARISON_ZIPS && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
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

          {/* Selected ZIP Tags (The Blue Checked Inputs) */}
          <div className="flex flex-wrap gap-3 p-2 bg-[#e5ebf2] rounded-lg border border-transparent">
            {selectedZips.map((zip) => (
              <button
                key={zip}
                onClick={() => handleRemoveZip(zip)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 
                  bg-blue-600 text-white shadow-md flex items-center 
                  ${
                    selectedZips.length <= 1
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }
                `}
                disabled={selectedZips.length <= 1} // Prevent removing the last one
              >
                {zip}
                {/* X icon for removal */}
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

        {/* Conditional Chart Rendering (Sections 2 and 3) */}
        {comparisonData.length > 0 && (
          <>
            {/* 2. Vertical Bar Chart (Comparison) */}
            <section className="lg:col-span-2">
              <VerticalBarChart data={comparisonData} loading={false} />
            </section>

            {/* 3. Pie Charts (Housing Mix) */}
            <section className="space-y-4 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-700 border-b pb-2">
                Housing Type Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {comparisonData.map((market) => (
                  <PieChart key={market.zip} market={market} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
