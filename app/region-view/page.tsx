"use client";
import { useEffect, useState } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
import { BubbleMap } from "../../src/components/ui/bubble-map";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);

  useEffect(() => {
    fetchMarketingData().then(setMarketingData);
  }, []);

  // Map approximate region coordinates (in real app, you’d use geocoding)
  const regionCoordinates: Record<string, [number, number]> = {
    "Abu Dhabi": [54.3773, 24.4539],
    "Dubai": [55.2962, 25.276987],
    "New York": [-74.006, 40.7128],
    "London": [-0.1276, 51.5072],
  };

  const regionData =
    marketingData?.campaigns?.flatMap(c =>
      c.regional_performance.map(r => ({
        region: r.region,
        country: r.country,
        latitude: regionCoordinates[r.region]?.[1] || 0,
        longitude: regionCoordinates[r.region]?.[0] || 0,
        spend: r.spend,
        revenue: r.revenue,
      }))
    ) || [];

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-10 text-center">
          <h1 className="text-4xl font-bold">Regional Performance</h1>
          <p className="text-gray-400 mt-2">Revenue and Spend by Region</p>
        </section>

        <div className="flex-1 p-6 overflow-y-auto">
          <BubbleMap title="Global Revenue and Spend Distribution" data={regionData} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
