"use client";
import { useEffect, useState } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
import { LineChart } from "../../src/components/ui/line-chart";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";

export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);

  useEffect(() => {
    fetchMarketingData().then(setMarketingData);
  }, []);

  const weeklyData =
    marketingData?.campaigns?.flatMap(c => c.weekly_performance.map(w => ({
      week: `${w.week_start.slice(5)}–${w.week_end.slice(5)}`,
      revenue: w.revenue,
      spend: w.spend,
    }))) || [];

  const summarized = weeklyData.reduce((acc: any, cur) => {
    const existing = acc.find((a: any) => a.week === cur.week);
    if (existing) {
      existing.revenue += cur.revenue;
      existing.spend += cur.spend;
    } else acc.push({ ...cur });
    return acc;
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-10 text-center">
          <h1 className="text-4xl font-bold">Weekly Performance</h1>
          <p className="text-gray-400 mt-2">Revenue and Spend Trends by Week</p>
        </section>

        <div className="flex-1 p-6 overflow-y-auto">
          <LineChart title="Weekly Revenue and Spend" data={summarized} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
