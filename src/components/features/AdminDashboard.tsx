import { useEffect, useState } from "react";
import { fetchStatsForZips } from "../../api/rentcast";
import type { MarketData } from "../types";

export function AdminDashboard() {
  const [data, setData] = useState<MarketData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const zips = ["32789", "32792", "32807"];

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchStatsForZips(zips);

        if (!res || res.length === 0) {
          console.warn("[Dashboard] No data returned from API");
          setError("No data received from API");
        } else {
          setData(res);
          // Development logging
          if (import.meta.env.DEV) {
            console.log(
              "[Dashboard] Processed data:",
              JSON.stringify(res, null, 2)
            );
          }
        }
      } catch (err: any) {
        console.error("[Dashboard] Fetch error:", err);
        const errorMessage = err?.message || "Unknown error occurred";
        console.error("[Dashboard] Error details:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
        <div className="mt-2 text-sm text-gray-600">
          An Error has Occurred. Please try again later.
        </div>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="p-6">
        <div>No data available</div>
        <div className="mt-2 text-sm text-gray-600">
          An Error has Occurred. Please try again later.
        </div>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
    </div>
  );
}
