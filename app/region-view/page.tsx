"use client";
import { useEffect, useState } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
import { BubbleMap } from "../../src/components/ui/bubble-map";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";
import { Switch } from "@headlessui/react"; // lightweight toggle

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [colorByRevenue, setColorByRevenue] = useState(true);

  useEffect(() => {
    fetchMarketingData().then(setMarketingData);
  }, []);

  // Approximate coordinates for known regions (you can add more)
  const regionCoordinates: Record<string, [number, number]> = {
    "Abu Dhabi": [54.3773, 24.4539],
    "Dubai": [55.2962, 25.276987],
    "New York": [-74.006, 40.7128],
    "London": [-0.1276, 51.5072],
    "Paris": [2.3522, 48.8566],
    "Tokyo": [139.6917, 35.6895],
    "Riyadh": [46.6753, 24.7136],
    "Cairo": [31.2357, 30.0444],
    "Doha": [51.531, 25.2854],
  };

  // Build region-level dataset
  const regionData =
    marketingData?.campaigns?.flatMap((c) =>
      c.regional_performance.map((r) => ({
        region: r.region,
        country: r.country,
        latitude: regionCoordinates[r.region]?.[1] || 0,
        longitude: regionCoordinates[r.region]?.[0] || 0,
        spend: r.spend,
        revenue: r.revenue,
      }))
    ) || [];

  // Determine which metric to color by
  const displayData = regionData.map((r) => ({
    ...r,
    revenue: colorByRevenue ? r.revenue : r.spend, // reuse color scale logic
  }));

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-10 text-center">
          <h1 className="text-4xl font-bold">Regional Performance</h1>
          <p className="text-gray-400 mt-2">Revenue and Spend by Region</p>
        </section>

        {/* Toggle control */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-3">
            <span className={`text-sm ${colorByRevenue ? "text-gray-400" : "text-green-400"}`}>
              Color by Spend
            </span>
            <Switch
              checked={colorByRevenue}
              onChange={setColorByRevenue}
              className={`${
                colorByRevenue ? "bg-blue-600" : "bg-gray-600"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
            >
              <span
                className={`${
                  colorByRevenue ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className={`text-sm ${colorByRevenue ? "text-yellow-400" : "text-gray-400"}`}>
              Color by Revenue
            </span>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="flex-1 p-6 overflow-y-auto">
          <BubbleMap
            title={`Global ${colorByRevenue ? "Revenue" : "Spend"} Distribution`}
            data={displayData}
          />
        </div>

        <Footer />
      </div>
    </div>
  );
}
